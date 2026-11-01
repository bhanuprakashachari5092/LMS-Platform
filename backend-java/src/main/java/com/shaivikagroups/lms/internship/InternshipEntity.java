package com.shaivikagroups.lms.internship;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "internships")
public class InternshipEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 64)
    private String tenantId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false, length = 100)
    private String domain;

    @Column(length = 100)
    private String department = "Engineering";

    @Column(name = "employment_type", nullable = false, length = 32)
    private String employmentType = "INTERNSHIP"; // INTERNSHIP, FULL_TIME, PART_TIME, CONTRACT

    @Column(name = "experience_level", nullable = false, length = 32)
    private String experienceLevel = "ENTRY_LEVEL"; // ENTRY_LEVEL, MID_LEVEL, SENIOR

    @Column(name = "internship_type", nullable = false, length = 32)
    private String internshipType = "REMOTE"; // REMOTE, HYBRID, ONSITE

    @Column(nullable = false, length = 64)
    private String duration = "12 Weeks";

    @Column(length = 100)
    private String location = "Remote, India";

    @Column(nullable = false)
    private Integer openings = 10;

    @Column(name = "deadline")
    private OffsetDateTime deadline;

    @Column(name = "stipend_type", nullable = false, length = 32)
    private String stipendType = "PERFORMANCE_BASED"; // UNPAID, PERFORMANCE_BASED, FIXED, NOT_DISCLOSED

    @Column(name = "stipend_amount", length = 100)
    private String stipendAmount;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String eligibility;

    @Column(name = "required_skills", nullable = false, columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(name = "preferred_skills", columnDefinition = "TEXT")
    private String preferredSkills;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(name = "learning_outcomes", columnDefinition = "TEXT")
    private String learningOutcomes;

    @Column(name = "mentor_name", length = 100)
    private String mentorName;

    @Column(name = "mentor_title", length = 100)
    private String mentorTitle;

    @Column(nullable = false, length = 32)
    private String status = "OPEN"; // OPEN / PUBLISHED, CLOSED, DRAFT, ARCHIVED

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public InternshipEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getInternshipType() { return internshipType; }
    public void setInternshipType(String internshipType) { this.internshipType = internshipType; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getOpenings() { return openings; }
    public void setOpenings(Integer openings) { this.openings = openings; }

    public OffsetDateTime getDeadline() { return deadline; }
    public void setDeadline(OffsetDateTime deadline) { this.deadline = deadline; }

    public String getStipendType() { return stipendType; }
    public void setStipendType(String stipendType) { this.stipendType = stipendType; }

    public String getStipendAmount() { return stipendAmount; }
    public void setStipendAmount(String stipendAmount) { this.stipendAmount = stipendAmount; }

    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }

    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }

    public String getPreferredSkills() { return preferredSkills; }
    public void setPreferredSkills(String preferredSkills) { this.preferredSkills = preferredSkills; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }

    public String getLearningOutcomes() { return learningOutcomes; }
    public void setLearningOutcomes(String learningOutcomes) { this.learningOutcomes = learningOutcomes; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorTitle() { return mentorTitle; }
    public void setMentorTitle(String mentorTitle) { this.mentorTitle = mentorTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
