package com.shaivikagroups.lms.practice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PracticeProblemRepository extends JpaRepository<PracticeProblemEntity, String> {

    Page<PracticeProblemEntity> findByTenantIdAndIsPublishedTrue(String tenantId, Pageable pageable);

    Page<PracticeProblemEntity> findByTenantId(String tenantId, Pageable pageable);

    Optional<PracticeProblemEntity> findByTenantIdAndSlug(String tenantId, String slug);

    Optional<PracticeProblemEntity> findByTenantIdAndId(String tenantId, String id);

    boolean existsByTenantIdAndSlug(String tenantId, String slug);
}

