package com.shaivikagroups.lms.quiz;

import java.time.Instant;

public class QuizStartResponse {
    private String attemptId;
    private String quizId;
    private int timeLimitSec;
    private Instant expiresAt;
    private QuizResponse quiz;

    public QuizStartResponse() {}

    public QuizStartResponse(String attemptId, String quizId, int timeLimitSec, Instant expiresAt, QuizResponse quiz) {
        this.attemptId = attemptId;
        this.quizId = quizId;
        this.timeLimitSec = timeLimitSec;
        this.expiresAt = expiresAt;
        this.quiz = quiz;
    }

    public String getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(String attemptId) {
        this.attemptId = attemptId;
    }

    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public int getTimeLimitSec() {
        return timeLimitSec;
    }

    public void setTimeLimitSec(int timeLimitSec) {
        this.timeLimitSec = timeLimitSec;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public QuizResponse getQuiz() {
        return quiz;
    }

    public void setQuiz(QuizResponse quiz) {
        this.quiz = quiz;
    }
}

