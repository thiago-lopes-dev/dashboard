package dev.dashboard.monitor.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "services")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceEntity {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String category = "API";

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp @Column(name = "updated_at")
    private Instant updatedAt;
}
