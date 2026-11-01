package com.shaivikagroups.lms.internship;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplicationEntity, String> {

    boolean existsByInternshipIdAndEmailIgnoreCase(String internshipId, String email);

    Optional<InternshipApplicationEntity> findByReferenceNumber(String referenceNumber);

    Optional<InternshipApplicationEntity> findByIdAndTenantId(String id, String tenantId);

    List<InternshipApplicationEntity> findByTenantIdAndUserIdOrderByAppliedAtDesc(String tenantId, String userId);

    List<InternshipApplicationEntity> findByTenantIdAndEmailIgnoreCaseOrderByAppliedAtDesc(String tenantId, String email);

    List<InternshipApplicationEntity> findByTenantIdAndInternshipIdOrderByAppliedAtDesc(String tenantId, String internshipId);

    List<InternshipApplicationEntity> findByTenantIdOrderByAppliedAtDesc(String tenantId);

    Page<InternshipApplicationEntity> findByTenantIdOrderByAppliedAtDesc(String tenantId, Pageable pageable);

    Page<InternshipApplicationEntity> findByTenantIdAndStatusOrderByAppliedAtDesc(String tenantId, String status, Pageable pageable);

    Page<InternshipApplicationEntity> findByTenantIdAndInternshipIdOrderByAppliedAtDesc(String tenantId, String internshipId, Pageable pageable);

    @Query("SELECT a FROM InternshipApplicationEntity a WHERE a.tenantId = :tenantId " +
           "AND (:internshipId IS NULL OR a.internshipId = :internshipId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:search IS NULL OR LOWER(a.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.college) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<InternshipApplicationEntity> searchApplications(
            @Param("tenantId") String tenantId,
            @Param("internshipId") String internshipId,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    long countByTenantId(String tenantId);

    long countByTenantIdAndStatus(String tenantId, String status);
}
