package dev.dashboard.monitor.domain.repository;

import dev.dashboard.monitor.domain.entity.Alert;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByResolvedFalseOrderByCreatedAtDesc(Pageable pageable);
    long countByResolvedFalse();
    long countBySeverityAndResolvedFalse(Alert.Severity severity);
}
