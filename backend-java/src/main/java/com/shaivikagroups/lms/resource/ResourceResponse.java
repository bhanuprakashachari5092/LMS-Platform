package com.shaivikagroups.lms.resource;

import java.time.Instant;

public class ResourceResponse {

    private String id;
    private String lessonId;
    private String title;
    private String description;
    private String type;
    private String url;
    private int orderIndex;
    private boolean downloadable;
    private Instant createdAt;

    public ResourceResponse() {}

    public static ResourceResponse fromEntity(LessonResourceEntity entity) {
        ResourceResponse res = new ResourceResponse();
        res.setId(entity.getId());
        res.setLessonId(entity.getLessonId());
        res.setTitle(entity.getTitle());
        res.setDescription(entity.getDescription());
        res.setType(entity.getType());
        res.setUrl(entity.getUrl());
        res.setOrderIndex(entity.getOrderIndex());
        res.setDownloadable(entity.isDownloadable());
        res.setCreatedAt(entity.getCreatedAt());
        return res;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public boolean isDownloadable() { return downloadable; }
    public void setDownloadable(boolean downloadable) { this.downloadable = downloadable; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

