package com.shaivikagroups.lms.lesson;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<LessonEntity, String> {

    List<LessonEntity> findByModuleIdOrderByOrderIndexAsc(String moduleId);

    List<LessonEntity> findByCourseIdOrderByOrderIndexAsc(String courseId);

    Optional<LessonEntity> findByIdAndModuleId(String id, String moduleId);

    Optional<LessonEntity> findByIdAndCourseId(String id, String courseId);

    int countByCourseId(String courseId);

    int countByModuleId(String moduleId);

    void deleteByModuleId(String moduleId);

    void deleteByCourseId(String courseId);
}

