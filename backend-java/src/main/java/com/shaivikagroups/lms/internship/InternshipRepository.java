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
public interface InternshipRepository extends JpaRepository<InternshipEntity, String> {

    List<InternshipEntity> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, String status);

    Optional<InternshipEntity> findByTenantIdAndSlug(String tenantId, String slug);

    Optional<InternshipEntity> findByTenantIdAndId(String tenantId, String id);

    Page<InternshipEntity> findByTenantIdAndStatus(String tenantId, String status, Pageable pageable);

    Page<InternshipEntity> findByTenantIdAndStatusIn(String tenantId, List<String> statuses, Pageable pageable);

    Page<InternshipEntity> findByTenantIdAndStatusAndDomain(String tenantId, String status, String domain, Pageable pageable);

    Page<InternshipEntity> findByTenantIdAndStatusAndInternshipType(String tenantId, String status, String internshipType, Pageable pageable);

    Page<InternshipEntity> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    long countByTenantIdAndStatus(String tenantId, String status);

    long countByTenantId(String tenantId);

    @Query("SELECT i FROM InternshipEntity i WHERE i.tenantId = :tenantId " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:domain IS NULL OR LOWER(i.domain) LIKE LOWER(CONCAT('%', :domain, '%'))) " +
           "AND (:department IS NULL OR LOWER(i.department) LIKE LOWER(CONCAT('%', :department, '%'))) " +
           "AND (:employmentType IS NULL OR i.employmentType = :employmentType) " +
           "AND (:internshipType IS NULL OR i.internshipType = :internshipType) " +
           "AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.requiredSkills) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<InternshipEntity> searchOpenings(
            @Param("tenantId") String tenantId,
            @Param("status") String status,
            @Param("domain") String domain,
            @Param("department") String department,
            @Param("employmentType") String employmentType,
            @Param("internshipType") String internshipType,
            @Param("search") String search,
            Pageable pageable
    );
}
