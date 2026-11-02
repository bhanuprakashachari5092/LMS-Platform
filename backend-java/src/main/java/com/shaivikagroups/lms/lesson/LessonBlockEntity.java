package com.shaivikagroups.lms.lesson;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "lesson_blocks")
public class LessonBlockEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "lesson_id", nullable = false, length = 64)
    private String lessonId;

    @Column(name = "order_index", nullable = false)
    private int orderIndex = 1;

    @Column(name = "block_type", nullable = false, length = 32)
    private String blockType; // markdown, code, callout, lab_step, quiz_inline, diagram

    @Column(name = "title", length = 255)
    private String title;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "content_payload", nullable = false, columnDefinition = "jsonb")
    private String contentPayload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public LessonBlockEntity() {}

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.contentPayload == null) {
            this.contentPayload = "{}";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public String getBlockType() { return blockType; }
    public void setBlockType(String blockType) { this.blockType = blockType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContentPayload() { return contentPayload; }
    public void setContentPayload(String contentPayload) { this.contentPayload = contentPayload; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

