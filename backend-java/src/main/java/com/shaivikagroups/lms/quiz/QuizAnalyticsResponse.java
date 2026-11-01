package com.shaivikagroups.lms.quiz;

import java.util.ArrayList;
import java.util.List;

public class QuizAnalyticsResponse {
    private int totalAttempts;
    private int passCount;
    private int failCount;
    private double passRate;
    private double averageScore;
    private List<QuestionStatDTO> questionStats = new ArrayList<>();

    public static class QuestionStatDTO {
        private String questionId;
        private String questionText;
        private double correctPercentage;

        public QuestionStatDTO() {}

        public QuestionStatDTO(String questionId, String questionText, double correctPercentage) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.correctPercentage = correctPercentage;
        }

        public String getQuestionId() {
            return questionId;
        }

        public void setQuestionId(String questionId) {
            this.questionId = questionId;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public double getCorrectPercentage() {
            return correctPercentage;
        }

        public void setCorrectPercentage(double correctPercentage) {
            this.correctPercentage = correctPercentage;
        }
    }

    public QuizAnalyticsResponse() {}

    public int getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(int totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public int getPassCount() {
        return passCount;
    }

    public void setPassCount(int passCount) {
        this.passCount = passCount;
    }

    public int getFailCount() {
        return failCount;
    }

    public void setFailCount(int failCount) {
        this.failCount = failCount;
    }

    public double getPassRate() {
        return passRate;
    }

    public void setPassRate(double passRate) {
        this.passRate = passRate;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

    public List<QuestionStatDTO> getQuestionStats() {
        return questionStats;
    }

    public void setQuestionStats(List<QuestionStatDTO> questionStats) {
        this.questionStats = questionStats;
    }
}

