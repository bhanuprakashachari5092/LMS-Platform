package com.shaivikagroups.lms.practice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PracticeDraftRepository extends JpaRepository<PracticeDraftEntity, String> {

    Optional<PracticeDraftEntity> findByTenantIdAndUserIdAndProblemIdAndLanguage(
            String tenantId, String userId, String problemId, String language);

    Optional<PracticeDraftEntity> findFirstByTenantIdAndUserIdAndProblemIdOrderByUpdatedAtDesc(
            String tenantId, String userId, String problemId);

    void deleteByTenantIdAndUserIdAndProblemIdAndLanguage(
            String tenantId, String userId, String problemId, String language);
}

