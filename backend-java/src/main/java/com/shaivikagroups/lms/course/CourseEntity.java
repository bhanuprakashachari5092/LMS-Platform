package com.shaivikagroups.lms.course;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "courses", uniqueConstraints = {
        @UniqueConstraint(name = "uq_courses_tenant_slug", columnNames = {"tenant_id", "slug"})
})
public class CourseEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 64)
    private String tenantId;

    @Column(name = "author_id", length = 64)
    private String authorId;

    @Column(name = "slug", nullable = false, length = 128)
    private String slug;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "subtitle", columnDefinition = "TEXT")
    private String subtitle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", nullable = false, length = 64)
    private String category = "Computer Science";

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 32)
    private CourseLevel level = CourseLevel.ALL_LEVELS;

    @Column(name = "visibility", nullable = false, length = 32)
    private String visibility = "public";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private CourseStatus status = CourseStatus.PUBLISHED;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "banner_url", columnDefinition = "TEXT")
    private String bannerUrl;

    @Column(name = "price_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceInr = BigDecimal.ZERO;

    @Column(name = "discount_price_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountPriceInr = BigDecimal.ZERO;

    @Column(name = "is_free", nullable = false)
    private boolean free = false;

    @Column(name = "estimated_duration_hours", precision = 6, scale = 1)
    private BigDecimal estimatedDurationHours = BigDecimal.valueOf(10.0);

    @Column(name = "total_enrolled", nullable = false)
    private int totalEnrolled = 0;

    @Column(name = "rating", nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.valueOf(4.90);

    @Column(name = "review_count", nullable = false)
    private int reviewCount = 0;

    @Column(name = "certificate_enabled", nullable = false)
    private boolean certificateEnabled = true;

    @Column(name = "syllabus_meta", columnDefinition = "TEXT")
    private String syllabusMeta = "[]";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public CourseEntity() {}

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.priceInr == null) {
            this.priceInr = BigDecimal.ZERO;
        }
        if (this.discountPriceInr == null) {
            this.discountPriceInr = BigDecimal.ZERO;
        }
        if (this.estimatedDurationHours == null) {
            this.estimatedDurationHours = BigDecimal.valueOf(10.0);
        }
        if (this.rating == null) {
            this.rating = BigDecimal.valueOf(4.90);
        }
        if (this.syllabusMeta == null) {
            this.syllabusMeta = "[]";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
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

    public CourseLevel getLevel() { return level; }
    public void setLevel(CourseLevel level) { this.level = level; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public CourseStatus getStatus() { return status; }
    public void setStatus(CourseStatus status) { this.status = status; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public BigDecimal getPriceInr() { return priceInr; }
    public void setPriceInr(BigDecimal priceInr) { this.priceInr = priceInr; }

    public BigDecimal getDiscountPriceInr() { return discountPriceInr; }
    public void setDiscountPriceInr(BigDecimal discountPriceInr) { this.discountPriceInr = discountPriceInr; }

    public boolean isFree() { return free; }
    public void setFree(boolean free) { this.free = free; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

