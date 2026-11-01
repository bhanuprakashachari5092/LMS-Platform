package com.shaivikagroups.lms.course;

import java.math.BigDecimal;
import java.time.Instant;

public class CourseResponse {

    private String id;
    private String tenantId;
    private String authorId;
    private String slug;
    private String title;
    private String subtitle;
    private String description;
    private String category;
    private String level;
    private String visibility;
    private String status;
    private String thumbnailUrl;
    private String bannerUrl;
    private BigDecimal priceInr;
    private BigDecimal discountPriceInr;
    private boolean isFree;
    private BigDecimal estimatedDurationHours;
    private int totalEnrolled;
    private BigDecimal rating;
    private int reviewCount;
    private boolean certificateEnabled;
    private String syllabusMeta;
    private int totalModules;
    private int totalLessons;
    private Instant createdAt;
    private Instant updatedAt;

    public CourseResponse() {}

    public static CourseResponse fromEntity(CourseEntity entity, int totalModules, int totalLessons) {
        CourseResponse res = new CourseResponse();
        res.setId(entity.getId());
        res.setTenantId(entity.getTenantId());
        res.setAuthorId(entity.getAuthorId());
        res.setSlug(entity.getSlug());
        res.setTitle(entity.getTitle());
        res.setSubtitle(entity.getSubtitle());
        res.setDescription(entity.getDescription());
        res.setCategory(entity.getCategory());
        res.setLevel(entity.getLevel() != null ? entity.getLevel().name().toLowerCase() : "all_levels");
        res.setVisibility(entity.getVisibility());
        res.setStatus(entity.getStatus() != null ? entity.getStatus().name().toLowerCase() : "published");
        res.setThumbnailUrl(entity.getThumbnailUrl());
        res.setBannerUrl(entity.getBannerUrl());
        res.setPriceInr(entity.getPriceInr());
        res.setDiscountPriceInr(entity.getDiscountPriceInr());
        res.setFree(entity.isFree());
        res.setEstimatedDurationHours(entity.getEstimatedDurationHours());
        res.setTotalEnrolled(entity.getTotalEnrolled());
        res.setRating(entity.getRating());
        res.setReviewCount(entity.getReviewCount());
        res.setCertificateEnabled(entity.isCertificateEnabled());
        res.setSyllabusMeta(entity.getSyllabusMeta());
        res.setTotalModules(totalModules);
        res.setTotalLessons(totalLessons);
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public BigDecimal getPriceInr() { return priceInr; }
    public void setPriceInr(BigDecimal priceInr) { this.priceInr = priceInr; }

    public BigDecimal getDiscountPriceInr() { return discountPriceInr; }
    public void setDiscountPriceInr(BigDecimal discountPriceInr) { this.discountPriceInr = discountPriceInr; }

    public boolean isFree() { return isFree; }
    public void setFree(boolean free) { isFree = free; }

    public BigDecimal getEstimatedDurationHours() { return estimatedDurationHours; }
    public void setEstimatedDurationHours(BigDecimal estimatedDurationHours) { this.estimatedDurationHours = estimatedDurationHours; }

    public int getTotalEnrolled() { return totalEnrolled; }
    public void setTotalEnrolled(int totalEnrolled) { this.totalEnrolled = totalEnrolled; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public boolean isCertificateEnabled() { return certificateEnabled; }
    public void setCertificateEnabled(boolean certificateEnabled) { this.certificateEnabled = certificateEnabled; }

    public String getSyllabusMeta() { return syllabusMeta; }
    public void setSyllabusMeta(String syllabusMeta) { this.syllabusMeta = syllabusMeta; }

    public int getTotalModules() { return totalModules; }
    public void setTotalModules(int totalModules) { this.totalModules = totalModules; }

    public int getTotalLessons() { return totalLessons; }
    public void setTotalLessons(int totalLessons) { this.totalLessons = totalLessons; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

