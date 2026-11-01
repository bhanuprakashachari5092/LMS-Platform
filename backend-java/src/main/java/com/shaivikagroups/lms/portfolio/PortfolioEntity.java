package com.shaivikagroups.lms.portfolio;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "portfolios", uniqueConstraints = {
        @UniqueConstraint(name = "uq_portfolios_tenant_handle", columnNames = {"tenant_id", "custom_handle"}),
        @UniqueConstraint(name = "uq_portfolios_tenant_user", columnNames = {"tenant_id", "user_id"})
})
public class PortfolioEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 64)
    private String tenantId;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "custom_handle", length = 64)
    private String customHandle;

    @Column(name = "headline", length = 255)
    private String headline;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "skills", columnDefinition = "TEXT")
    private String skillsPayload = "[]";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "projects", columnDefinition = "TEXT")
    private String projectsPayload = "[]";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "social_links", columnDefinition = "TEXT")
    private String socialLinksPayload = "{}";

    @Column(name = "resume_url", columnDefinition = "TEXT")
    private String resumeUrl;

    @Column(name = "accent_color", length = 32)
    private String accentColor = "#4f46e5";

    @Column(name = "template", length = 64)
    private String template = "modern_tech";

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = Instant.now();
    }

    public PortfolioEntity() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCustomHandle() {
        return customHandle;
    }

    public void setCustomHandle(String customHandle) {
        this.customHandle = customHandle;
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

    public String getSkillsPayload() {
        return skillsPayload;
    }

    public void setSkillsPayload(String skillsPayload) {
        this.skillsPayload = skillsPayload;
    }

    public String getProjectsPayload() {
        return projectsPayload;
    }

    public void setProjectsPayload(String projectsPayload) {
        this.projectsPayload = projectsPayload;
    }

    public String getSocialLinksPayload() {
        return socialLinksPayload;
    }

    public void setSocialLinksPayload(String socialLinksPayload) {
        this.socialLinksPayload = socialLinksPayload;
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

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

