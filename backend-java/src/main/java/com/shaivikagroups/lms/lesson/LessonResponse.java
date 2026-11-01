package com.shaivikagroups.lms.lesson;

import com.shaivikagroups.lms.resource.ResourceResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class LessonResponse {

    private String id;
    private String moduleId;
    private String courseId;
    private int orderIndex;
    private String title;
    private String type;
    private int durationMinutes;
    private boolean freePreview;
    private String content;
    private String videoUrl;
    private String videoProvider;
    private int videoDurationSeconds;
    private List<LessonBlockDTO> blocks = new ArrayList<>();
    private List<ResourceResponse> resources = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public LessonResponse() {}

    public static LessonResponse fromEntity(LessonEntity entity, List<LessonBlockDTO> blocks, List<ResourceResponse> resources) {
        LessonResponse res = new LessonResponse();
        res.setId(entity.getId());
        res.setModuleId(entity.getModuleId());
        res.setCourseId(entity.getCourseId());
        res.setOrderIndex(entity.getOrderIndex());
        res.setTitle(entity.getTitle());
        res.setType(entity.getType());
        res.setDurationMinutes(entity.getDurationMinutes());
        res.setFreePreview(entity.isFreePreview());
        res.setContent(entity.getContent());
        res.setVideoUrl(entity.getVideoUrl());
        res.setVideoProvider(entity.getVideoProvider());
        res.setVideoDurationSeconds(entity.getVideoDurationSeconds());
        res.setBlocks(blocks != null ? blocks : new ArrayList<>());
        res.setResources(resources != null ? resources : new ArrayList<>());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public boolean isFreePreview() { return freePreview; }
    public void setFreePreview(boolean freePreview) { this.freePreview = freePreview; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getVideoProvider() { return videoProvider; }
    public void setVideoProvider(String videoProvider) { this.videoProvider = videoProvider; }

    public int getVideoDurationSeconds() { return videoDurationSeconds; }
    public void setVideoDurationSeconds(int videoDurationSeconds) { this.videoDurationSeconds = videoDurationSeconds; }

    public List<LessonBlockDTO> getBlocks() { return blocks; }
    public void setBlocks(List<LessonBlockDTO> blocks) { this.blocks = blocks; }

    public List<ResourceResponse> getResources() { return resources; }
    public void setResources(List<ResourceResponse> resources) { this.resources = resources; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

