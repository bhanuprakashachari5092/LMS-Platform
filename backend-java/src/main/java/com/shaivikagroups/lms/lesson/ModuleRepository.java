package com.shaivikagroups.lms.lesson;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, String> {

    List<ModuleEntity> findByCourseIdOrderByOrderIndexAsc(String courseId);

    Optional<ModuleEntity> findByIdAndCourseId(String id, String courseId);

    int countByCourseId(String courseId);

    void deleteByCourseId(String courseId);
}

