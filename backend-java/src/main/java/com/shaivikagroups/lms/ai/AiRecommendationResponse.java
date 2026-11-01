package com.shaivikagroups.lms.ai;

import java.util.ArrayList;
import java.util.List;

public class AiRecommendationResponse {

    private String careerGoal;
    private String learningPathAdvice;
    private List<CourseRecommendation> recommendations = new ArrayList<>();
    private List<String> nextSteps = new ArrayList<>();
    private String source;

    public AiRecommendationResponse() {}

    public static class CourseRecommendation {
        private String courseId;
        private String title;
        private String description;
        private String reason;
        private String difficulty;
        private int matchScore; // 0 - 100

        public CourseRecommendation() {}

        public CourseRecommendation(String courseId, String title, String description, String reason, String difficulty, int matchScore) {
            this.courseId = courseId;
            this.title = title;
            this.description = description;
            this.reason = reason;
            this.difficulty = difficulty;
            this.matchScore = matchScore;
        }

        public String getCourseId() {
            return courseId;
        }

        public void setCourseId(String courseId) {
            this.courseId = courseId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }

        public int getMatchScore() {
            return matchScore;
        }

        public void setMatchScore(int matchScore) {
            this.matchScore = matchScore;
        }
    }

    public String getCareerGoal() {
        return careerGoal;
    }

    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }

    public String getLearningPathAdvice() {
        return learningPathAdvice;
    }

    public void setLearningPathAdvice(String learningPathAdvice) {
        this.learningPathAdvice = learningPathAdvice;
    }

    public List<CourseRecommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<CourseRecommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getNextSteps() {
        return nextSteps;
    }

    public void setNextSteps(List<String> nextSteps) {
        this.nextSteps = nextSteps;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}

