package com.shaivikagroups.lms.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResourceEntity, String> {

    List<LessonResourceEntity> findByLessonIdOrderByOrderIndexAsc(String lessonId);

    void deleteByLessonId(String lessonId);
}

