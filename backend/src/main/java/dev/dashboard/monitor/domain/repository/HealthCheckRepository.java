package dev.dashboard.monitor.domain.repository;

import dev.dashboard.monitor.domain.entity.HealthCheck;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HealthCheckRepository extends JpaRepository<HealthCheck, UUID> {
    List<HealthCheck> findByServiceIdOrderByCheckedAtDesc(UUID serviceId, Pageable pageable);
    Optional<HealthCheck> findTopByServiceIdOrderByCheckedAtDesc(UUID serviceId);
    long countByServiceIdAndStatus(UUID serviceId, HealthCheck.HealthStatus status);
}
