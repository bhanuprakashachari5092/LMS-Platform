package com.shaivikagroups.lms.lesson;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class LessonRequest {

    @NotBlank(message = "Lesson title is required")
    private String title;

    private String type = "reading";
    private int durationMinutes = 15;
    private boolean freePreview = false;
    private String content;
    private String videoUrl;
    private String videoProvider = "youtube";
    private int videoDurationSeconds = 0;
    private int orderIndex = 1;
    private List<LessonBlockDTO> blocks;

    public LessonRequest() {}

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

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public List<LessonBlockDTO> getBlocks() { return blocks; }
    public void setBlocks(List<LessonBlockDTO> blocks) { this.blocks = blocks; }
}

