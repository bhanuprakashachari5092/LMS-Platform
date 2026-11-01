package com.shaivikagroups.lms.user;

import java.time.Instant;

public class UserResponse {

    private String id;
    private String tenantId;
    private String email;
    private String fullName;
    private String displayName;
    private Role role;
    private UserStatus status;
    private String phone;
    private String avatarUrl;
    private String githubUsername;
    private String githubUrl;
    private String bio;
    private boolean emailVerified;
    private int xpPoints;
    private int streakCount;
    private Instant lastActiveAt;
    private Instant createdAt;

    public UserResponse() {
    }

    public static UserResponse fromEntity(UserEntity entity) {
        if (entity == null) {
            return null;
        }
        UserResponse dto = new UserResponse();
        dto.setId(entity.getId());
        dto.setTenantId(entity.getTenantId());
        dto.setEmail(entity.getEmail());
        dto.setFullName(entity.getFullName());
        dto.setDisplayName(entity.getDisplayName());
        dto.setRole(entity.getRole());
        dto.setStatus(entity.getStatus());
        dto.setPhone(entity.getPhone());
        dto.setAvatarUrl(entity.getAvatarUrl());
        dto.setGithubUsername(entity.getGithubUsername());
        dto.setGithubUrl(entity.getGithubUrl());
        dto.setBio(entity.getBio());
        dto.setEmailVerified(entity.isEmailVerified());
        dto.setXpPoints(entity.getXpPoints());
        dto.setStreakCount(entity.getStreakCount());
        dto.setLastActiveAt(entity.getLastActiveAt());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getGithubUsername() {
        return githubUsername;
    }

    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public int getXpPoints() {
        return xpPoints;
    }

    public void setXpPoints(int xpPoints) {
        this.xpPoints = xpPoints;
    }

    public int getStreakCount() {
        return streakCount;
    }

    public void setStreakCount(int streakCount) {
        this.streakCount = streakCount;
    }

    public Instant getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(Instant lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

