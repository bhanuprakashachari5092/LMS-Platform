package com.shaivikagroups.lms.course;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, String> {

    Optional<CourseEntity> findByTenantIdAndSlug(String tenantId, String slug);

    Optional<CourseEntity> findByTenantIdAndId(String tenantId, String id);

    boolean existsByTenantIdAndSlug(String tenantId, String slug);

    Page<CourseEntity> findByTenantId(String tenantId, Pageable pageable);

    Page<CourseEntity> findByTenantIdAndStatus(String tenantId, CourseStatus status, Pageable pageable);

    @Query("SELECT c FROM CourseEntity c WHERE c.tenantId = :tenantId " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:category IS NULL OR LOWER(c.category) = LOWER(:category)) " +
           "AND (:level IS NULL OR c.level = :level) " +
           "AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<CourseEntity> searchCourses(
            @Param("tenantId") String tenantId,
            @Param("status") CourseStatus status,
            @Param("category") String category,
            @Param("level") CourseLevel level,
            @Param("search") String search,
            Pageable pageable);

    long countByTenantId(String tenantId);

    long countByTenantIdAndStatus(String tenantId, CourseStatus status);
}

