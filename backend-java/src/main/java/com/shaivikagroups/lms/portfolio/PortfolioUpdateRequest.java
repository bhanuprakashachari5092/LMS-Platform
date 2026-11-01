package com.shaivikagroups.lms.portfolio;

import java.util.List;
import java.util.Map;

public class PortfolioUpdateRequest {

    private String fullName;
    private String headline;
    private String bio;
    private String customHandle;
    private String resumeUrl;
    private String accentColor;
    private String template;
    private Boolean isPublic;
    private List<String> skills;
    private List<PortfolioProjectDto> projects;
    private Map<String, String> socialLinks;

    public PortfolioUpdateRequest() {}

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getCustomHandle() {
        return customHandle;
    }

    public void setCustomHandle(String customHandle) {
        this.customHandle = customHandle;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<PortfolioProjectDto> getProjects() {
        return projects;
    }

    public void setProjects(List<PortfolioProjectDto> projects) {
        this.projects = projects;
    }

    public Map<String, String> getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(Map<String, String> socialLinks) {
        this.socialLinks = socialLinks;
    }
}

