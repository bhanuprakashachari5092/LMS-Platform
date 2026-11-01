package com.shaivikagroups.lms.internship;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "internship_tasks")
public class InternshipTaskEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "internship_id", nullable = false, length = 64)
    private String internshipId;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber = 1;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String deliverables;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore = 100;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 1;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public InternshipTaskEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInternshipId() { return internshipId; }
    public void setInternshipId(String internshipId) { this.internshipId = internshipId; }

    public Integer getWeekNumber() { return weekNumber; }
    public void setWeekNumber(Integer weekNumber) { this.weekNumber = weekNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDeliverables() { return deliverables; }
    public void setDeliverables(String deliverables) { this.deliverables = deliverables; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

