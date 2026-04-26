package dev.dashboard.monitor.api.controller;

import dev.dashboard.monitor.api.dto.Dtos;
import dev.dashboard.monitor.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    @Operation(summary = "Resumo geral")
    public ResponseEntity<Dtos.DashboardSummary> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/services")
    @Operation(summary = "Lista serviços")
    public ResponseEntity<List<Dtos.ServiceResponse>> getServices() {
        return ResponseEntity.ok(dashboardService.getAllServices());
    }

    @PostMapping("/services")
    @Operation(summary = "Cria serviço")
    public ResponseEntity<Dtos.ServiceResponse> createService(
        @Valid @RequestBody Dtos.ServiceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(dashboardService.createService(req));
    }

    @DeleteMapping("/services/{id}")
    @Operation(summary = "Desativa serviço")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        dashboardService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/services/{id}/history")
    @Operation(summary = "Histórico de health checks")
    public ResponseEntity<List<Dtos.HealthCheckResponse>> getHistory(
        @PathVariable UUID id,
        @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(dashboardService.getServiceHistory(id, limit));
    }

    @GetMapping("/metrics")
    @Operation(summary = "Histórico de métricas")
    public ResponseEntity<List<Dtos.SystemMetricResponse>> getMetrics(
        @RequestParam(defaultValue = "60") int limit) {
        return ResponseEntity.ok(dashboardService.getMetricsHistory(limit));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Alertas ativos")
    public ResponseEntity<List<Dtos.AlertResponse>> getAlerts() {
        return ResponseEntity.ok(dashboardService.getActiveAlerts());
    }

    @PatchMapping("/alerts/{id}/resolve")
    @Operation(summary = "Resolve alerta")
    public ResponseEntity<Void> resolveAlert(@PathVariable UUID id) {
        dashboardService.resolveAlert(id);
        return ResponseEntity.noContent().build();
    }
}
