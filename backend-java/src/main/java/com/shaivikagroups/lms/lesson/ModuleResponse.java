package com.shaivikagroups.lms.lesson;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ModuleResponse {

    private String id;
    private String courseId;
    private int orderIndex;
    private String title;
    private String description;
    private int durationMinutes;
    private List<LessonResponse> lessons = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public ModuleResponse() {}

    public static ModuleResponse fromEntity(ModuleEntity entity, List<LessonResponse> lessons) {
        ModuleResponse res = new ModuleResponse();
        res.setId(entity.getId());
        res.setCourseId(entity.getCourseId());
        res.setOrderIndex(entity.getOrderIndex());
        res.setTitle(entity.getTitle());
        res.setDescription(entity.getDescription());
        res.setDurationMinutes(entity.getDurationMinutes());
        res.setLessons(lessons != null ? lessons : new ArrayList<>());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public List<LessonResponse> getLessons() { return lessons; }
    public void setLessons(List<LessonResponse> lessons) { this.lessons = lessons; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

