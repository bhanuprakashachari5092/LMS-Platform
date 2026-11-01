package com.shaivikagroups.lms.ai;

public class AiChatResponse {
    private String reply;
    private String language;
    private String source; // GEMINI_AI or MENTOR_KNOWLEDGE_ENGINE

    public AiChatResponse() {}

    public AiChatResponse(String reply, String language, String source) {
        this.reply = reply;
        this.language = language;
        this.source = source;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}

