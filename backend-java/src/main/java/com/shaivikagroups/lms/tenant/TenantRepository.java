package com.shaivikagroups.lms.tenant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<TenantEntity, String> {

    Optional<TenantEntity> findBySlug(String slug);

    Optional<TenantEntity> findByDomain(String domain);

    Optional<TenantEntity> findByCustomDomain(String customDomain);

    boolean existsBySlug(String slug);
}

