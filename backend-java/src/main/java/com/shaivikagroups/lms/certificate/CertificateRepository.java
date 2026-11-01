package com.shaivikagroups.lms.certificate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<CertificateEntity, String> {

    Optional<CertificateEntity> findByCertificateNumber(String certificateNumber);

    Optional<CertificateEntity> findByTenantIdAndUserIdAndCourseId(String tenantId, String userId, String courseId);

    List<CertificateEntity> findByTenantIdAndUserIdOrderByCreatedAtDesc(String tenantId, String userId);

    List<CertificateEntity> findByTenantIdAndCourseIdOrderByCreatedAtDesc(String tenantId, String courseId);

    boolean existsByTenantIdAndUserIdAndCourseId(String tenantId, String userId, String courseId);
}

