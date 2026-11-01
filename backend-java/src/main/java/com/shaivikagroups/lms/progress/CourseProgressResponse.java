package com.shaivikagroups.lms.progress;

import java.util.ArrayList;
import java.util.List;

public class CourseProgressResponse {

    private String enrollmentId;
    private String courseId;
    private int progressPercentage;
    private int totalLessons;
    private int completedLessonsCount;
    private String lastAccessedLessonId;
    private List<String> completedLessonIds = new ArrayList<>();
    private List<String> inProgressLessonIds = new ArrayList<>();

    public CourseProgressResponse() {}

    public String getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(String enrollmentId) { this.enrollmentId = enrollmentId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }

    public int getTotalLessons() { return totalLessons; }
    public void setTotalLessons(int totalLessons) { this.totalLessons = totalLessons; }

    public int getCompletedLessonsCount() { return completedLessonsCount; }
    public void setCompletedLessonsCount(int completedLessonsCount) { this.completedLessonsCount = completedLessonsCount; }

    public String getLastAccessedLessonId() { return lastAccessedLessonId; }
    public void setLastAccessedLessonId(String lastAccessedLessonId) { this.lastAccessedLessonId = lastAccessedLessonId; }

    public List<String> getCompletedLessonIds() { return completedLessonIds; }
    public void setCompletedLessonIds(List<String> completedLessonIds) { this.completedLessonIds = completedLessonIds; }

    public List<String> getInProgressLessonIds() { return inProgressLessonIds; }
    public void setInProgressLessonIds(List<String> inProgressLessonIds) { this.inProgressLessonIds = inProgressLessonIds; }
}

