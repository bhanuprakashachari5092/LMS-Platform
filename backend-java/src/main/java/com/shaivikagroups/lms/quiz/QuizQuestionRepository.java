package com.shaivikagroups.lms.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestionEntity, String> {

    List<QuizQuestionEntity> findByQuizIdOrderByOrderIndexAsc(String quizId);

    void deleteByQuizId(String quizId);
}

