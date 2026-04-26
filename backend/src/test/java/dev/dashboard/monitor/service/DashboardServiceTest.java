package dev.dashboard.monitor.service;

import dev.dashboard.monitor.api.dto.Dtos;
import dev.dashboard.monitor.domain.entity.*;
import dev.dashboard.monitor.domain.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService — testes unitários")
class DashboardServiceTest {

    @Mock ServiceRepository      serviceRepo;
    @Mock HealthCheckRepository  healthRepo;
    @Mock SystemMetricRepository metricRepo;
    @Mock AlertRepository        alertRepo;
    @Mock HealthCheckService     healthCheckService;

    @InjectMocks DashboardService dashboardService;

    private ServiceEntity service;

    @BeforeEach
    void setUp() {
        service = ServiceEntity.builder()
            .id(UUID.randomUUID()).name("Test API")
            .url("http://test.com/health").category("API").active(true)
            .build();
    }

    @Test
    @DisplayName("getSummary conta corretamente serviços UP")
    void getSummary_countsUp() {
        var hc = HealthCheck.builder()
            .service(service)
            .status(HealthCheck.HealthStatus.UP)
            .responseTime(100)
            .build();

        when(serviceRepo.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(service));
        when(healthRepo.findTopByServiceIdOrderByCheckedAtDesc(service.getId()))
            .thenReturn(Optional.of(hc));
        when(metricRepo.findTopByOrderByRecordedAtDesc()).thenReturn(Optional.empty());
        when(alertRepo.countByResolvedFalse()).thenReturn(0L);
        when(alertRepo.countBySeverityAndResolvedFalse(any(Alert.Severity.class))).thenReturn(0L);

        var summary = dashboardService.getSummary();

        assertThat(summary.servicesUp()).isEqualTo(1);
        assertThat(summary.servicesDown()).isEqualTo(0);
        assertThat(summary.totalServices()).isEqualTo(1);
    }

    @Test
    @DisplayName("getSummary retorna UNKNOWN quando sem health check")
    void getSummary_unknownWithoutCheck() {
        when(serviceRepo.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(service));
        when(healthRepo.findTopByServiceIdOrderByCheckedAtDesc(service.getId()))
            .thenReturn(Optional.empty());
        when(metricRepo.findTopByOrderByRecordedAtDesc()).thenReturn(Optional.empty());
        when(alertRepo.countByResolvedFalse()).thenReturn(0L);
        when(alertRepo.countBySeverityAndResolvedFalse(any(Alert.Severity.class))).thenReturn(0L);

        var summary = dashboardService.getSummary();
        assertThat(summary.services().get(0).lastStatus())
            .isEqualTo(HealthCheck.HealthStatus.UNKNOWN);
    }

    @Test
    @DisplayName("createService persiste e retorna o serviço")
    void createService_persists() {
        var req = new Dtos.ServiceRequest("Nova API", "http://nova.com/health", "Desc", "API");
        when(serviceRepo.save(any(ServiceEntity.class))).thenReturn(service);

        var result = dashboardService.createService(req);

        assertThat(result).isNotNull();
        verify(serviceRepo, times(1)).save(any(ServiceEntity.class));
    }

    @Test
    @DisplayName("deleteService faz soft delete")
    void deleteService_softDelete() {
        when(serviceRepo.findById(service.getId())).thenReturn(Optional.of(service));

        dashboardService.deleteService(service.getId());

        assertThat(service.getActive()).isFalse();
        verify(serviceRepo).save(service);
    }
}
