package dev.dashboard.monitor.domain.repository;

import dev.dashboard.monitor.domain.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, UUID> {
    List<ServiceEntity> findByActiveTrueOrderByCreatedAtDesc();
}
