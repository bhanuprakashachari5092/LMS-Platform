package com.shaivikagroups.lms.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOptionEntity, String> {

    List<QuizOptionEntity> findByQuestionIdOrderByOrderIndexAsc(String questionId);
}

