package com.shaivikagroups.lms.practice.dto;

public class LanguageConfigDTO {

    private String id;
    private String displayName;
    private String monacoLanguage;
    private int judge0Id;
    private String extension;
    private String starterCode;
    private boolean enabled;

    public LanguageConfigDTO() {}

    public LanguageConfigDTO(String id, String displayName, String monacoLanguage, int judge0Id, String extension, String starterCode, boolean enabled) {
        this.id = id;
        this.displayName = displayName;
        this.monacoLanguage = monacoLanguage;
        this.judge0Id = judge0Id;
        this.extension = extension;
        this.starterCode = starterCode;
        this.enabled = enabled;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getMonacoLanguage() {
        return monacoLanguage;
    }

    public void setMonacoLanguage(String monacoLanguage) {
        this.monacoLanguage = monacoLanguage;
    }

    public int getJudge0Id() {
        return judge0Id;
    }

    public void setJudge0Id(int judge0Id) {
        this.judge0Id = judge0Id;
    }

    public String getExtension() {
        return extension;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }

    public String getStarterCode() {
        return starterCode;
    }

    public void setStarterCode(String starterCode) {
        this.starterCode = starterCode;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}

