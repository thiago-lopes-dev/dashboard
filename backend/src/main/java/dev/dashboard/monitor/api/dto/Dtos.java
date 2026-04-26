package dev.dashboard.monitor.api.dto;

import dev.dashboard.monitor.domain.entity.Alert;
import dev.dashboard.monitor.domain.entity.HealthCheck;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class Dtos {

    public record LoginRequest(
        @NotBlank(message = "Email é obrigatório") String email,
        @NotBlank(message = "Senha é obrigatória") String password
    ) {}

    public record LoginResponse(
        String token, String type, String name, String email, String role
    ) {}

    public record ServiceRequest(
        @NotBlank String name,
        @NotBlank String url,
        String description,
        String category
    ) {}

    public record ServiceResponse(
        UUID id, String name, String url, String description,
        String category, Boolean active,
        HealthCheck.HealthStatus lastStatus,
        Integer lastResponseTime, Instant lastCheckedAt, Instant createdAt
    ) {}

    public record HealthCheckResponse(
        UUID id, UUID serviceId, String serviceName,
        HealthCheck.HealthStatus status,
        Integer responseTime, Integer statusCode,
        String errorMessage, Instant checkedAt
    ) {}

    public record SystemMetricResponse(
        UUID id, BigDecimal cpuUsage, BigDecimal memoryUsage,
        Long memoryTotalMb, Long memoryUsedMb,
        BigDecimal diskUsage, Long diskTotalGb, Long diskUsedGb,
        Integer activeThreads, Instant recordedAt
    ) {}

    public record AlertResponse(
        UUID id, UUID serviceId, String serviceName,
        Alert.Severity severity, String title, String message,
        Boolean resolved, Instant resolvedAt, Instant createdAt
    ) {}

    public record DashboardSummary(
        long totalServices, long servicesUp, long servicesDown,
        long servicesDegraded, long activeAlerts, long criticalAlerts,
        SystemMetricResponse latestMetric, List<ServiceResponse> services
    ) {}
}
