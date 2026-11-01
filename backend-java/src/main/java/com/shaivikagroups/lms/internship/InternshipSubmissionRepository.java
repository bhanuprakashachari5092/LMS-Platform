package com.shaivikagroups.lms.internship;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipSubmissionRepository extends JpaRepository<InternshipSubmissionEntity, String> {
    List<InternshipSubmissionEntity> findByEnrollmentId(String enrollmentId);
    Optional<InternshipSubmissionEntity> findByEnrollmentIdAndTaskId(String enrollmentId, String taskId);
    long countByEnrollmentIdAndStatus(String enrollmentId, String status);
}

