package com.shaivikagroups.lms.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttemptEntity, String> {

    List<QuizAttemptEntity> findByTenantIdAndUserIdAndQuizIdOrderByAttemptNumberDesc(String tenantId, String userId, String quizId);

    int countByTenantIdAndUserIdAndQuizId(String tenantId, String userId, String quizId);

    List<QuizAttemptEntity> findByQuizIdOrderByAttemptedAtDesc(String quizId);
}

