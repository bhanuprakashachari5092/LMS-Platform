package com.shaivikagroups.lms.internship;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplicationEntity, String> {

    boolean existsByInternshipIdAndEmailIgnoreCase(String internshipId, String email);

    List<InternshipApplicationEntity> findByTenantIdAndUserIdOrderByAppliedAtDesc(String tenantId, String userId);

    List<InternshipApplicationEntity> findByTenantIdAndEmailIgnoreCaseOrderByAppliedAtDesc(String tenantId, String email);

    Page<InternshipApplicationEntity> findByTenantIdOrderByAppliedAtDesc(String tenantId, Pageable pageable);

    Page<InternshipApplicationEntity> findByTenantIdAndStatusOrderByAppliedAtDesc(String tenantId, String status, Pageable pageable);

    Page<InternshipApplicationEntity> findByTenantIdAndInternshipIdOrderByAppliedAtDesc(String tenantId, String internshipId, Pageable pageable);

    long countByTenantId(String tenantId);

    long countByTenantIdAndStatus(String tenantId, String status);

    Optional<InternshipApplicationEntity> findByIdAndTenantId(String id, String tenantId);
}
