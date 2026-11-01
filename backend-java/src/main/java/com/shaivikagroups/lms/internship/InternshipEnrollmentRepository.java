package com.shaivikagroups.lms.internship;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipEnrollmentRepository extends JpaRepository<InternshipEnrollmentEntity, String> {
    List<InternshipEnrollmentEntity> findByTenantIdAndUserIdOrderByCreatedAtDesc(String tenantId, String userId);
    Optional<InternshipEnrollmentEntity> findByInternshipIdAndUserId(String internshipId, String userId);
    Page<InternshipEnrollmentEntity> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);
    long countByTenantIdAndStatus(String tenantId, String status);
}

