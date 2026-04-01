package dev.dashboard.monitor.service;

import dev.dashboard.monitor.api.dto.Dtos;
import dev.dashboard.monitor.domain.entity.*;
import dev.dashboard.monitor.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ServiceRepository      serviceRepo;
    private final HealthCheckRepository  healthRepo;
    private final SystemMetricRepository metricRepo;
    private final AlertRepository        alertRepo;
    private final HealthCheckService     healthCheckService;

    // ─── Dashboard Summary ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Dtos.DashboardSummary getSummary() {
        var services = serviceRepo.findByActiveTrueOrderByCreatedAtDesc();
        long up = 0, down = 0, degraded = 0;
        var serviceResponses = new ArrayList<Dtos.ServiceResponse>();

        for (var svc : services) {
            var lastCheck = healthRepo.findTopByServiceIdOrderByCheckedAtDesc(svc.getId());
            var status    = lastCheck.map(HealthCheck::getStatus)
                                     .orElse(HealthCheck.HealthStatus.UNKNOWN);
            switch (status) {
                case UP       -> up++;
                case DOWN     -> down++;
                case DEGRADED -> degraded++;
                default       -> {}
            }
            serviceResponses.add(toServiceResponse(svc, lastCheck.orElse(null)));
        }

        var latestMetric = metricRepo.findTopByOrderByRecordedAtDesc()
                                     .map(this::toMetricResponse)
                                     .orElse(null);

        return new Dtos.DashboardSummary(
            services.size(), up, down, degraded,
            alertRepo.countByResolvedFalse(),
            alertRepo.countBySeverityAndResolvedFalse(Alert.Severity.CRITICAL),
            latestMetric, serviceResponses
        );
    }

    // ─── Services ─────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Dtos.ServiceResponse> getAllServices() {
        return serviceRepo.findByActiveTrueOrderByCreatedAtDesc().stream()
            .map(svc -> toServiceResponse(svc,
                healthRepo.findTopByServiceIdOrderByCheckedAtDesc(svc.getId()).orElse(null)))
            .toList();
    }

    @Transactional
    public Dtos.ServiceResponse createService(Dtos.ServiceRequest req) {
        var entity = ServiceEntity.builder()
            .name(req.name().trim())
            .url(req.url().trim())
            .description(req.description())
            .category(req.category() != null ? req.category() : "API")
            .build();
        return toServiceResponse(serviceRepo.save(entity), null);
    }

    @Transactional
    public void deleteService(UUID id) {
        serviceRepo.findById(id).ifPresent(svc -> {
            svc.setActive(false);
            serviceRepo.save(svc);
        });
    }

    // ─── HealthChecks ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Dtos.HealthCheckResponse> getServiceHistory(UUID serviceId, int limit) {
        return healthRepo
            .findByServiceIdOrderByCheckedAtDesc(serviceId, PageRequest.of(0, Math.min(limit, 200)))
            .stream().map(this::toHealthResponse).toList();
    }

    // ─── Metrics ──────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Dtos.SystemMetricResponse> getMetricsHistory(int limit) {
        return metricRepo.findAllByOrderByRecordedAtDesc(PageRequest.of(0, Math.min(limit, 300)))
            .stream().map(this::toMetricResponse).toList();
    }

    // ─── Alerts ───────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Dtos.AlertResponse> getActiveAlerts() {
        return alertRepo.findByResolvedFalseOrderByCreatedAtDesc(PageRequest.of(0, 50))
            .stream().map(this::toAlertResponse).toList();
    }

    @Transactional
    public void resolveAlert(UUID alertId) {
        alertRepo.findById(alertId).ifPresent(alert -> {
            alert.setResolved(true);
            alert.setResolvedAt(Instant.now());
            alertRepo.save(alert);
        });
    }

    // ─── Scheduled: Health Checks ─────────────────────────────────────────────
    @Scheduled(fixedRateString = "${app.check.interval-ms:30000}")
    @Transactional
    public void runHealthChecks() {
        var services = serviceRepo.findByActiveTrueOrderByCreatedAtDesc();
        log.debug("Executando health checks em {} serviços...", services.size());

        for (var svc : services) {
            try {
                var result = healthCheckService.check(svc);
                healthRepo.save(result);

                if (result.getStatus() == HealthCheck.HealthStatus.DOWN) {
                    long downs = healthRepo.countByServiceIdAndStatus(
                        svc.getId(), HealthCheck.HealthStatus.DOWN);
                    if (downs == 1) {
                        alertRepo.save(Alert.builder()
                            .service(svc)
                            .severity(Alert.Severity.CRITICAL)
                            .title("Serviço fora do ar: " + svc.getName())
                            .message("Erro: " + (result.getErrorMessage() != null
                                ? result.getErrorMessage() : "timeout"))
                            .build());
                        log.warn("ALERTA CRÍTICO: {}", svc.getName());
                    }
                }
            } catch (Exception e) {
                log.error("Erro no health check de {}: {}", svc.getName(), e.getMessage());
            }
        }
    }

    // ─── Scheduled: System Metrics ────────────────────────────────────────────
    @Scheduled(fixedRateString = "${app.metrics.interval-ms:15000}")
    @Transactional
    public void collectSystemMetrics() {
        try {
            Runtime       runtime = Runtime.getRuntime();
            MemoryMXBean  memBean = ManagementFactory.getMemoryMXBean();
            var           threads = ManagementFactory.getThreadMXBean();
            OperatingSystemMXBean os = ManagementFactory.getOperatingSystemMXBean();

            long totalMem = runtime.totalMemory() / (1024 * 1024);
            long freeMem  = runtime.freeMemory()  / (1024 * 1024);
            long usedMem  = totalMem - freeMem;

            // Usa load average padrão (disponível em todos JVMs)
            double loadAvg = os.getSystemLoadAverage();
            // Converte load average para % aproximada (load/cores * 100)
            int    cores   = os.getAvailableProcessors();
            double cpuPct  = loadAvg < 0 ? 0 : Math.min(100, (loadAvg / cores) * 100);

            metricRepo.save(SystemMetric.builder()
                .cpuUsage(BigDecimal.valueOf(cpuPct).setScale(2, RoundingMode.HALF_UP))
                .memoryUsage(totalMem > 0
                    ? BigDecimal.valueOf((double) usedMem / totalMem * 100)
                        .setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO)
                .memoryTotalMb(totalMem)
                .memoryUsedMb(usedMem)
                .activeThreads(threads.getThreadCount())
                .diskUsage(BigDecimal.ZERO)
                .diskTotalGb(0L)
                .diskUsedGb(0L)
                .build());

        } catch (Exception e) {
            log.error("Erro ao coletar métricas: {}", e.getMessage());
        }
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────
    private Dtos.ServiceResponse toServiceResponse(ServiceEntity svc, HealthCheck hc) {
        return new Dtos.ServiceResponse(
            svc.getId(), svc.getName(), svc.getUrl(),
            svc.getDescription(), svc.getCategory(), svc.getActive(),
            hc != null ? hc.getStatus()       : HealthCheck.HealthStatus.UNKNOWN,
            hc != null ? hc.getResponseTime() : null,
            hc != null ? hc.getCheckedAt()    : null,
            svc.getCreatedAt()
        );
    }

    private Dtos.HealthCheckResponse toHealthResponse(HealthCheck hc) {
        return new Dtos.HealthCheckResponse(
            hc.getId(), hc.getService().getId(), hc.getService().getName(),
            hc.getStatus(), hc.getResponseTime(), hc.getStatusCode(),
            hc.getErrorMessage(), hc.getCheckedAt()
        );
    }

    private Dtos.SystemMetricResponse toMetricResponse(SystemMetric m) {
        return new Dtos.SystemMetricResponse(
            m.getId(), m.getCpuUsage(), m.getMemoryUsage(),
            m.getMemoryTotalMb(), m.getMemoryUsedMb(),
            m.getDiskUsage(), m.getDiskTotalGb(), m.getDiskUsedGb(),
            m.getActiveThreads(), m.getRecordedAt()
        );
    }

    private Dtos.AlertResponse toAlertResponse(Alert a) {
        return new Dtos.AlertResponse(
            a.getId(),
            a.getService() != null ? a.getService().getId()   : null,
            a.getService() != null ? a.getService().getName() : null,
            a.getSeverity(), a.getTitle(), a.getMessage(),
            a.getResolved(), a.getResolvedAt(), a.getCreatedAt()
        );
    }
}
