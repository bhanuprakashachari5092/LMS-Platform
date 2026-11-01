package com.shaivikagroups.lms.lesson;

public class LessonBlockDTO {

    private String id;
    private int orderIndex;
    private String blockType;
    private String title;
    private String contentPayload;

    public LessonBlockDTO() {}

    public LessonBlockDTO(String id, int orderIndex, String blockType, String title, String contentPayload) {
        this.id = id;
        this.orderIndex = orderIndex;
        this.blockType = blockType;
        this.title = title;
        this.contentPayload = contentPayload;
    }

    public static LessonBlockDTO fromEntity(LessonBlockEntity entity) {
        return new LessonBlockDTO(
                entity.getId(),
                entity.getOrderIndex(),
                entity.getBlockType(),
                entity.getTitle(),
                entity.getContentPayload()
        );
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public String getBlockType() { return blockType; }
    public void setBlockType(String blockType) { this.blockType = blockType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContentPayload() { return contentPayload; }
    public void setContentPayload(String contentPayload) { this.contentPayload = contentPayload; }
}

