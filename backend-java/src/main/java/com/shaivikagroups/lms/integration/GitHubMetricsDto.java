package com.shaivikagroups.lms.integration;

import com.shaivikagroups.lms.portfolio.PortfolioProjectDto;

import java.util.ArrayList;
import java.util.List;

public class GitHubMetricsDto {

    private String username;
    private String avatarUrl;
    private String name;
    private String bio;
    private int publicRepos;
    private int followers;
    private int following;
    private int starsCount;
    private List<String> primaryLanguages = new ArrayList<>();
    private List<PortfolioProjectDto> pinnedProjects = new ArrayList<>();
    private int qualityScore;
    private int portfolioScore;
    private String lastUpdated;

    public GitHubMetricsDto() {}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public int getPublicRepos() {
        return publicRepos;
    }

    public void setPublicRepos(int publicRepos) {
        this.publicRepos = publicRepos;
    }

    public int getFollowers() {
        return followers;
    }

    public void setFollowers(int followers) {
        this.followers = followers;
    }

    public int getFollowing() {
        return following;
    }

    public void setFollowing(int following) {
        this.following = following;
    }

    public int getStarsCount() {
        return starsCount;
    }

    public void setStarsCount(int starsCount) {
        this.starsCount = starsCount;
    }

    public List<String> getPrimaryLanguages() {
        return primaryLanguages;
    }

    public void setPrimaryLanguages(List<String> primaryLanguages) {
        this.primaryLanguages = primaryLanguages;
    }

    public List<PortfolioProjectDto> getPinnedProjects() {
        return pinnedProjects;
    }

    public void setPinnedProjects(List<PortfolioProjectDto> pinnedProjects) {
        this.pinnedProjects = pinnedProjects;
    }

    public int getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(int qualityScore) {
        this.qualityScore = qualityScore;
    }

    public int getPortfolioScore() {
        return portfolioScore;
    }

    public void setPortfolioScore(int portfolioScore) {
        this.portfolioScore = portfolioScore;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}

