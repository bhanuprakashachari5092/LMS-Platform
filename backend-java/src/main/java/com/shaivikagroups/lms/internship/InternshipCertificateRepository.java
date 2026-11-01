package com.shaivikagroups.lms.internship;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipCertificateRepository extends JpaRepository<InternshipCertificateEntity, String> {
    Optional<InternshipCertificateEntity> findByCertificateNumber(String certificateNumber);
    List<InternshipCertificateEntity> findByTenantIdAndUserId(String tenantId, String userId);
    Optional<InternshipCertificateEntity> findByEnrollmentId(String enrollmentId);
}

