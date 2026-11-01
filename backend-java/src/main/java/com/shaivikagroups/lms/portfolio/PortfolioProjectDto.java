package com.shaivikagroups.lms.portfolio;

import java.util.ArrayList;
import java.util.List;

public class PortfolioProjectDto {
    private String id;
    private String title;
    private String description;
    private List<String> tags = new ArrayList<>();
    private String githubUrl;
    private String liveUrl;
    private boolean featured;
    private int stars;
    private String language;

    public PortfolioProjectDto() {}

    public PortfolioProjectDto(String id, String title, String description, List<String> tags, String githubUrl, String liveUrl, boolean featured) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.githubUrl = githubUrl;
        this.liveUrl = liveUrl;
        this.featured = featured;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLiveUrl() {
        return liveUrl;
    }

    public void setLiveUrl(String liveUrl) {
        this.liveUrl = liveUrl;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}

