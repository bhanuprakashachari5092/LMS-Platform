package com.shaivikagroups.lms.lesson;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonBlockRepository extends JpaRepository<LessonBlockEntity, String> {

    List<LessonBlockEntity> findByLessonIdOrderByOrderIndexAsc(String lessonId);

    void deleteByLessonId(String lessonId);
}

