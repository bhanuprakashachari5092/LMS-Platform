package com.shaivikagroups.lms.lesson;

import jakarta.validation.constraints.NotBlank;

public class ModuleRequest {

    @NotBlank(message = "Module title is required")
    private String title;

    private String description;
    private int durationMinutes = 60;
    private int orderIndex = 1;

    public ModuleRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
}

