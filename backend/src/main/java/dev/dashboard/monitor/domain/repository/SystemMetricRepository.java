package dev.dashboard.monitor.domain.repository;

import dev.dashboard.monitor.domain.entity.SystemMetric;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemMetricRepository extends JpaRepository<SystemMetric, UUID> {
    Optional<SystemMetric> findTopByOrderByRecordedAtDesc();
    List<SystemMetric> findAllByOrderByRecordedAtDesc(Pageable pageable);
}
