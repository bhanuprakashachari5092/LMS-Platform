package com.shaivikagroups.lms.ai;

import java.util.List;

public class AiRecommendationRequest {
    private String studentId;
    private List<String> completedCourseIds;
    private List<String> interests;
    private String careerGoal;

    public AiRecommendationRequest() {}

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public List<String> getCompletedCourseIds() {
        return completedCourseIds;
    }

    public void setCompletedCourseIds(List<String> completedCourseIds) {
        this.completedCourseIds = completedCourseIds;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public String getCareerGoal() {
        return careerGoal;
    }

    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }
}

