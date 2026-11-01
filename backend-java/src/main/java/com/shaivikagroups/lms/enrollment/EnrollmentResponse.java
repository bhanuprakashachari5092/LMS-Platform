package com.shaivikagroups.lms.enrollment;

import com.shaivikagroups.lms.course.CourseEntity;
import java.time.Instant;

public class EnrollmentResponse {

    private String id;
    private String tenantId;
    private String userId;
    private String courseId;
    private String courseTitle;
    private String courseSlug;
    private String courseThumbnail;
    private String status;
    private int progressPercentage;
    private String lastAccessedLessonId;
    private Instant lastAccessedAt;
    private Instant enrolledAt;
    private Instant completedAt;

    public EnrollmentResponse() {}

    public static EnrollmentResponse fromEntity(EnrollmentEntity entity, CourseEntity course) {
        EnrollmentResponse res = new EnrollmentResponse();
        res.setId(entity.getId());
        res.setTenantId(entity.getTenantId());
        res.setUserId(entity.getUserId());
        res.setCourseId(entity.getCourseId());
        res.setStatus(entity.getStatus() != null ? entity.getStatus().name() : "ACTIVE");
        res.setProgressPercentage(entity.getProgressPercentage());
        res.setLastAccessedLessonId(entity.getLastAccessedLessonId());
        res.setLastAccessedAt(entity.getLastAccessedAt());
        res.setEnrolledAt(entity.getEnrolledAt());
        res.setCompletedAt(entity.getCompletedAt());

        if (course != null) {
            res.setCourseTitle(course.getTitle());
            res.setCourseSlug(course.getSlug());
            res.setCourseThumbnail(course.getThumbnailUrl());
        }
        return res;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getCourseSlug() { return courseSlug; }
    public void setCourseSlug(String courseSlug) { this.courseSlug = courseSlug; }

    public String getCourseThumbnail() { return courseThumbnail; }
    public void setCourseThumbnail(String courseThumbnail) { this.courseThumbnail = courseThumbnail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }

    public String getLastAccessedLessonId() { return lastAccessedLessonId; }
    public void setLastAccessedLessonId(String lastAccessedLessonId) { this.lastAccessedLessonId = lastAccessedLessonId; }

    public Instant getLastAccessedAt() { return lastAccessedAt; }
    public void setLastAccessedAt(Instant lastAccessedAt) { this.lastAccessedAt = lastAccessedAt; }

    public Instant getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(Instant enrolledAt) { this.enrolledAt = enrolledAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}

