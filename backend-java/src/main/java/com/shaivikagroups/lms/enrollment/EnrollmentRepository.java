package com.shaivikagroups.lms.enrollment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, String> {

    Optional<EnrollmentEntity> findByTenantIdAndUserIdAndCourseId(String tenantId, String userId, String courseId);

    Page<EnrollmentEntity> findByTenantIdAndUserId(String tenantId, String userId, Pageable pageable);

    Page<EnrollmentEntity> findByTenantIdAndCourseId(String tenantId, String courseId, Pageable pageable);

    boolean existsByTenantIdAndUserIdAndCourseId(String tenantId, String userId, String courseId);

    long countByTenantIdAndCourseId(String tenantId, String courseId);

    long countByTenantIdAndUserId(String tenantId, String userId);
}

