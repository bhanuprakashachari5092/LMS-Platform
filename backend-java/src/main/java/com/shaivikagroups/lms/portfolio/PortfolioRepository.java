package com.shaivikagroups.lms.portfolio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<PortfolioEntity, String> {

    Optional<PortfolioEntity> findByTenantIdAndCustomHandle(String tenantId, String customHandle);

    Optional<PortfolioEntity> findByTenantIdAndUserId(String tenantId, String userId);

    Optional<PortfolioEntity> findByTenantIdAndId(String tenantId, String id);

    Optional<PortfolioEntity> findByCustomHandle(String customHandle);

    boolean existsByTenantIdAndCustomHandle(String tenantId, String customHandle);

    boolean existsByCustomHandle(String customHandle);
}

