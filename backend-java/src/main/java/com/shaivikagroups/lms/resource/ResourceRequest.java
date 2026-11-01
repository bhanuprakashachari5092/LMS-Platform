package com.shaivikagroups.lms.resource;

import jakarta.validation.constraints.NotBlank;

public class ResourceRequest {

    @NotBlank(message = "Resource title is required")
    private String title;

    private String description;
    private String type = "pdf";

    @NotBlank(message = "Resource URL is required")
    private String url;

    private int orderIndex = 1;
    private boolean downloadable = true;

    public ResourceRequest() {}

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
}

