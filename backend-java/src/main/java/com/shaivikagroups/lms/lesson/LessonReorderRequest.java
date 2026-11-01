package com.shaivikagroups.lms.lesson;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class LessonReorderRequest {

    @NotEmpty(message = "Reorder items list cannot be empty")
    private List<ReorderItem> items;

    public LessonReorderRequest() {}

    public LessonReorderRequest(List<ReorderItem> items) {
        this.items = items;
    }

    public List<ReorderItem> getItems() { return items; }
    public void setItems(List<ReorderItem> items) { this.items = items; }

    public static class ReorderItem {
        private String lessonId;
        private String moduleId;
        private int orderIndex;

        public ReorderItem() {}

        public ReorderItem(String lessonId, String moduleId, int orderIndex) {
            this.lessonId = lessonId;
            this.moduleId = moduleId;
            this.orderIndex = orderIndex;
        }

        public String getLessonId() { return lessonId; }
        public void setLessonId(String lessonId) { this.lessonId = lessonId; }

        public String getModuleId() { return moduleId; }
        public void setModuleId(String moduleId) { this.moduleId = moduleId; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    }
}

