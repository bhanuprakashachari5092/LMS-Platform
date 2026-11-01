package com.shaivikagroups.lms.assignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<AssignmentEntity, String> {

    List<AssignmentEntity> findByCourseId(String courseId);

    Optional<AssignmentEntity> findByLessonId(String lessonId);
}

