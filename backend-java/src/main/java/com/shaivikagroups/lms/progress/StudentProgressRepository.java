package com.shaivikagroups.lms.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends JpaRepository<StudentProgressEntity, String> {

    Optional<StudentProgressEntity> findByEnrollmentIdAndLessonId(String enrollmentId, String lessonId);

    List<StudentProgressEntity> findByEnrollmentId(String enrollmentId);

    long countByEnrollmentIdAndStatus(String enrollmentId, ProgressStatus status);

    void deleteByEnrollmentId(String enrollmentId);
}

