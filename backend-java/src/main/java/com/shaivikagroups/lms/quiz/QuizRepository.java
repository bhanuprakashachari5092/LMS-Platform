package com.shaivikagroups.lms.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<QuizEntity, String> {

    List<QuizEntity> findByCourseId(String courseId);

    Optional<QuizEntity> findByLessonId(String lessonId);
}

