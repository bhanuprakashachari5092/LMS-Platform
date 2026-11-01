package com.shaivikagroups.lms.tenant;

import java.math.BigDecimal;
import java.time.Instant;

public class TenantResponse {

    private String id;
    private String name;
    private String slug;
    private String domain;
    private String customDomain;
    private String logoUrl;
    private String faviconUrl;
    private String brandColor;
    private String secondaryColor;
    private String planTier;
    private int maxStudents;
    private int maxCourses;
    private BigDecimal maxStorageGb;
    private String status;
    private Instant createdAt;

    public TenantResponse() {
    }

    public static TenantResponse fromEntity(TenantEntity entity) {
        if (entity == null) {
            return null;
        }
        TenantResponse dto = new TenantResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSlug(entity.getSlug());
        dto.setDomain(entity.getDomain());
        dto.setCustomDomain(entity.getCustomDomain());
        dto.setLogoUrl(entity.getLogoUrl());
        dto.setFaviconUrl(entity.getFaviconUrl());
        dto.setBrandColor(entity.getBrandColor());
        dto.setSecondaryColor(entity.getSecondaryColor());
        dto.setPlanTier(entity.getPlanTier());
        dto.setMaxStudents(entity.getMaxStudents());
        dto.setMaxCourses(entity.getMaxCourses());
        dto.setMaxStorageGb(entity.getMaxStorageGb());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getCustomDomain() {
        return customDomain;
    }

    public void setCustomDomain(String customDomain) {
        this.customDomain = customDomain;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getFaviconUrl() {
        return faviconUrl;
    }

    public void setFaviconUrl(String faviconUrl) {
        this.faviconUrl = faviconUrl;
    }

    public String getBrandColor() {
        return brandColor;
    }

    public void setBrandColor(String brandColor) {
        this.brandColor = brandColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }

    public String getPlanTier() {
        return planTier;
    }

    public void setPlanTier(String planTier) {
        this.planTier = planTier;
    }

    public int getMaxStudents() {
        return maxStudents;
    }

    public void setMaxStudents(int maxStudents) {
        this.maxStudents = maxStudents;
    }

    public int getMaxCourses() {
        return maxCourses;
    }

    public void setMaxCourses(int maxCourses) {
        this.maxCourses = maxCourses;
    }

    public BigDecimal getMaxStorageGb() {
        return maxStorageGb;
    }

    public void setMaxStorageGb(BigDecimal maxStorageGb) {
        this.maxStorageGb = maxStorageGb;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

