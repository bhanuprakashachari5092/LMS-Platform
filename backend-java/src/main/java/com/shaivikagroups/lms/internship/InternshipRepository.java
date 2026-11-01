package com.shaivikagroups.lms.internship;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipRepository extends JpaRepository<InternshipEntity, String> {

    List<InternshipEntity> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, String status);

    Optional<InternshipEntity> findByTenantIdAndSlug(String tenantId, String slug);

    Optional<InternshipEntity> findByTenantIdAndId(String tenantId, String id);

    Page<InternshipEntity> findByTenantIdAndStatus(String tenantId, String status, Pageable pageable);

    Page<InternshipEntity> findByTenantIdAndStatusAndDomain(String tenantId, String status, String domain, Pageable pageable);

    Page<InternshipEntity> findByTenantIdAndStatusAndInternshipType(String tenantId, String status, String internshipType, Pageable pageable);

    Page<InternshipEntity> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    long countByTenantIdAndStatus(String tenantId, String status);
}
