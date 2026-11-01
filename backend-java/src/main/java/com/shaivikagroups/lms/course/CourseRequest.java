package com.shaivikagroups.lms.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class CourseRequest {

    @NotBlank(message = "Course title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String slug;
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
    private Boolean isFree;
    private BigDecimal estimatedDurationHours;
    private Boolean certificateEnabled;
    private String syllabusMeta;

    public CourseRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

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

    public Boolean getIsFree() { return isFree; }
    public void setIsFree(Boolean free) { isFree = free; }

    public BigDecimal getEstimatedDurationHours() { return estimatedDurationHours; }
    public void setEstimatedDurationHours(BigDecimal estimatedDurationHours) { this.estimatedDurationHours = estimatedDurationHours; }

    public Boolean getCertificateEnabled() { return certificateEnabled; }
    public void setCertificateEnabled(Boolean certificateEnabled) { this.certificateEnabled = certificateEnabled; }

    public String getSyllabusMeta() { return syllabusMeta; }
    public void setSyllabusMeta(String syllabusMeta) { this.syllabusMeta = syllabusMeta; }
}

