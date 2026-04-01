package dev.dashboard.monitor.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "health_checks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HealthCheck {

    public enum HealthStatus { UP, DOWN, DEGRADED, UNKNOWN }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private HealthStatus status = HealthStatus.UNKNOWN;

    @Column(name = "response_time")
    private Integer responseTime;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp @Column(name = "checked_at", updatable = false)
    private Instant checkedAt;
}
