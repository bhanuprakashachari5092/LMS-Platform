package com.shaivikagroups.lms.quiz;

import java.util.Map;

public class QuizSubmitRequest {
    private String attemptId;
    private int timeSpentSeconds;
    private Map<String, Object> answers; // questionId -> selectedOptionId or text

    public QuizSubmitRequest() {}

    public QuizSubmitRequest(String attemptId, int timeSpentSeconds, Map<String, Object> answers) {
        this.attemptId = attemptId;
        this.timeSpentSeconds = timeSpentSeconds;
        this.answers = answers;
    }

    public String getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(String attemptId) {
        this.attemptId = attemptId;
    }

    public int getTimeSpentSeconds() {
        return timeSpentSeconds;
    }

    public void setTimeSpentSeconds(int timeSpentSeconds) {
        this.timeSpentSeconds = timeSpentSeconds;
    }

    public Map<String, Object> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, Object> answers) {
        this.answers = answers;
    }
}

