package com.shaivikagroups.lms.assignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmissionEntity, String> {

    List<AssignmentSubmissionEntity> findByTenantIdAndAssignmentId(String tenantId, String assignmentId);

    Optional<AssignmentSubmissionEntity> findByTenantIdAndUserIdAndAssignmentId(String tenantId, String userId, String assignmentId);

    List<AssignmentSubmissionEntity> findByTenantIdAndUserId(String tenantId, String userId);
}

