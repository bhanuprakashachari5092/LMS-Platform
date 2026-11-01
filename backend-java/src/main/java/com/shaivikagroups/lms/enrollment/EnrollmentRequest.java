package com.shaivikagroups.lms.enrollment;

import jakarta.validation.constraints.NotBlank;

public class EnrollmentRequest {

    @NotBlank(message = "Course ID is required")
    private String courseId;

    public EnrollmentRequest() {}

    public EnrollmentRequest(String courseId) {
        this.courseId = courseId;
    }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
}

