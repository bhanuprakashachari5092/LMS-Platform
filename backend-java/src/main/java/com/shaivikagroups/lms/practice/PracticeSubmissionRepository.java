package com.shaivikagroups.lms.practice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PracticeSubmissionRepository extends JpaRepository<PracticeSubmissionEntity, String> {

    Page<PracticeSubmissionEntity> findByTenantIdAndUserIdOrderByCreatedAtDesc(String tenantId, String userId, Pageable pageable);

    Page<PracticeSubmissionEntity> findByTenantIdAndUserIdAndProblemIdOrderByCreatedAtDesc(
            String tenantId, String userId, String problemId, Pageable pageable);

    Page<PracticeSubmissionEntity> findByTenantIdAndProblemIdOrderByCreatedAtDesc(
            String tenantId, String problemId, Pageable pageable);

    Optional<PracticeSubmissionEntity> findByTenantIdAndId(String tenantId, String id);

    long countByTenantIdAndUserIdAndVerdict(String tenantId, String userId, String verdict);

    long countByTenantIdAndProblemId(String tenantId, String problemId);
}

