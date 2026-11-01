package com.shaivikagroups.lms.course;

import java.math.BigDecimal;

public class CourseSummaryResponse {

    private String id;
    private String slug;
    private String title;
    private String subtitle;
    private String category;
    private String level;
    private String status;
    private String thumbnailUrl;
    private BigDecimal priceInr;
    private BigDecimal discountPriceInr;
    private boolean isFree;
    private BigDecimal rating;
    private int totalEnrolled;
    private BigDecimal estimatedDurationHours;

    public CourseSummaryResponse() {}

    public static CourseSummaryResponse fromEntity(CourseEntity entity) {
        CourseSummaryResponse res = new CourseSummaryResponse();
        res.setId(entity.getId());
        res.setSlug(entity.getSlug());
        res.setTitle(entity.getTitle());
        res.setSubtitle(entity.getSubtitle());
        res.setCategory(entity.getCategory());
        res.setLevel(entity.getLevel() != null ? entity.getLevel().name().toLowerCase() : "all_levels");
        res.setStatus(entity.getStatus() != null ? entity.getStatus().name().toLowerCase() : "published");
        res.setThumbnailUrl(entity.getThumbnailUrl());
        res.setPriceInr(entity.getPriceInr());
        res.setDiscountPriceInr(entity.getDiscountPriceInr());
        res.setFree(entity.isFree());
        res.setRating(entity.getRating());
        res.setTotalEnrolled(entity.getTotalEnrolled());
        res.setEstimatedDurationHours(entity.getEstimatedDurationHours());
        return res;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public BigDecimal getPriceInr() { return priceInr; }
    public void setPriceInr(BigDecimal priceInr) { this.priceInr = priceInr; }

    public BigDecimal getDiscountPriceInr() { return discountPriceInr; }
    public void setDiscountPriceInr(BigDecimal discountPriceInr) { this.discountPriceInr = discountPriceInr; }

    public boolean isFree() { return isFree; }
    public void setFree(boolean free) { isFree = free; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public int getTotalEnrolled() { return totalEnrolled; }
    public void setTotalEnrolled(int totalEnrolled) { this.totalEnrolled = totalEnrolled; }

    public BigDecimal getEstimatedDurationHours() { return estimatedDurationHours; }
    public void setEstimatedDurationHours(BigDecimal estimatedDurationHours) { this.estimatedDurationHours = estimatedDurationHours; }
}

