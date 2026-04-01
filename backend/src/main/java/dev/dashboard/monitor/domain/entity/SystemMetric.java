package dev.dashboard.monitor.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "system_metrics")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SystemMetric {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "cpu_usage",       precision = 5, scale = 2) private BigDecimal cpuUsage;
    @Column(name = "memory_usage",    precision = 5, scale = 2) private BigDecimal memoryUsage;
    @Column(name = "memory_total_mb") private Long memoryTotalMb;
    @Column(name = "memory_used_mb")  private Long memoryUsedMb;
    @Column(name = "disk_usage",      precision = 5, scale = 2) private BigDecimal diskUsage;
    @Column(name = "disk_total_gb")   private Long diskTotalGb;
    @Column(name = "disk_used_gb")    private Long diskUsedGb;
    @Column(name = "active_threads")  private Integer activeThreads;

    @CreationTimestamp @Column(name = "recorded_at", updatable = false)
    private Instant recordedAt;
}
