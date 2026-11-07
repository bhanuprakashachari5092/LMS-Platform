package com.shaivikagroups.lms.internship;

import com.shaivikagroups.lms.common.ConflictException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.integration.sheets.GoogleSheetsService;
import com.shaivikagroups.lms.internship.dto.*;
import com.shaivikagroups.lms.notification.EmailService;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InternshipService {

    private static final Logger log = LoggerFactory.getLogger(InternshipService.class);

    private final InternshipRepository internshipRepository;
    private final InternshipApplicationRepository applicationRepository;
    private final InternshipInterviewRepository interviewRepository;
    private final InternshipEnrollmentRepository enrollmentRepository;
    private final InternshipTaskRepository taskRepository;
    private final InternshipSubmissionRepository submissionRepository;
    private final InternshipCertificateRepository certificateRepository;

    @Autowired(required = false)
    private EmailService emailService;

    @Autowired(required = false)
    private GoogleSheetsService googleSheetsService;

    public InternshipService(
            InternshipRepository internshipRepository,
            InternshipApplicationRepository applicationRepository,
            InternshipInterviewRepository interviewRepository,
            InternshipEnrollmentRepository enrollmentRepository,
            InternshipTaskRepository taskRepository,
            InternshipSubmissionRepository submissionRepository,
            InternshipCertificateRepository certificateRepository) {
        this.internshipRepository = internshipRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.taskRepository = taskRepository;
        this.submissionRepository = submissionRepository;
        this.certificateRepository = certificateRepository;
    }

    // =========================================================================
    // PUBLIC & CANDIDATE BROWSING
    // =========================================================================

    @Transactional(readOnly = true)
    public Page<InternshipDTO> getOpenInternships(String domain, String department, String employmentType, String internshipType, String search, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        String domainParam = (domain != null && !domain.trim().isEmpty() && !"ALL".equalsIgnoreCase(domain)) ? domain.trim() : null;
        String deptParam = (department != null && !department.trim().isEmpty() && !"ALL".equalsIgnoreCase(department)) ? department.trim() : null;
        String empTypeParam = (employmentType != null && !employmentType.trim().isEmpty() && !"ALL".equalsIgnoreCase(employmentType)) ? employmentType.trim() : null;
        String typeParam = (internshipType != null && !internshipType.trim().isEmpty() && !"ALL".equalsIgnoreCase(internshipType)) ? internshipType.trim() : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        if (domainParam != null || deptParam != null || empTypeParam != null || typeParam != null || searchParam != null) {
            return internshipRepository.searchOpenings(
                    tenantId, "OPEN", domainParam, deptParam, empTypeParam, typeParam, searchParam, pageable
            ).map(this::toDTO);
        }

        return internshipRepository.findByTenantIdAndStatusIn(tenantId, List.of("OPEN", "PUBLISHED"), pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public InternshipDetailDTO getInternshipDetail(String slugOrId) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity entity = internshipRepository.findByTenantIdAndSlug(tenantId, slugOrId)
                .or(() -> internshipRepository.findByTenantIdAndId(tenantId, slugOrId))
                .orElseThrow(() -> new ResourceNotFoundException("Career opening not found with identifier: " + slugOrId));

        List<InternshipTaskEntity> tasks = taskRepository.findByInternshipIdOrderByDisplayOrderAsc(entity.getId());
        List<InternshipDetailDTO.InternshipTaskDTO> taskDTOs = tasks.stream()
                .map(t -> new InternshipDetailDTO.InternshipTaskDTO(
                        t.getId(), t.getWeekNumber(), t.getTitle(), t.getDescription(),
                        t.getDeliverables(), t.getMaxScore(), t.getDisplayOrder()
                ))
                .toList();

        return new InternshipDetailDTO(
                entity.getId(), entity.getTitle(), entity.getSlug(), entity.getDomain(),
                entity.getDepartment(), entity.getEmploymentType(), entity.getExperienceLevel(),
                entity.getInternshipType(), entity.getDuration(), entity.getLocation(),
                entity.getOpenings(), entity.getDeadline(), entity.getStipendType(),
                entity.getStipendAmount(), entity.getEligibility(), entity.getRequiredSkills(),
                entity.getPreferredSkills(), entity.getDescription(), entity.getResponsibilities(),
                entity.getLearningOutcomes(), entity.getMentorName(), entity.getMentorTitle(),
                entity.getStatus(), entity.getIsFeatured(), entity.getCreatedAt(), taskDTOs
        );
    }

    // =========================================================================
    // APPLICATION SUBMISSION, STATUS TRACKING & WITHDRAWAL
    // =========================================================================

    @Transactional
    public InternshipApplicationDTO submitApplication(SubmitApplicationRequest request, UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity internship = internshipRepository.findById(request.internshipId())
                .orElseThrow(() -> new ResourceNotFoundException("Internship opening not found."));

        // Duplicate Check: Prevent multiple active applications for same opening by same email
        if (applicationRepository.existsByInternshipIdAndEmailIgnoreCase(internship.getId(), request.email().trim())) {
            throw new ConflictException("You have already submitted an application for this role. You can track your status in your dashboard.");
        }

        // Generate unique application reference number: KZQ-APP-2026-XXXXX
        String refNo = "KZQ-APP-" + OffsetDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        InternshipApplicationEntity app = new InternshipApplicationEntity();
        app.setId("app-" + UUID.randomUUID().toString().substring(0, 8));
        app.setReferenceNumber(refNo);
        app.setInternshipId(internship.getId());
        app.setTenantId(tenantId);
        if (currentUser != null) {
            app.setUserId(currentUser.getId());
        }
        app.setFullName(request.fullName().trim());
        app.setEmail(request.email().trim().toLowerCase());
        app.setPhone(request.phone().trim());
        app.setCollege(request.college().trim());
        app.setDegree(request.degree().trim());
        app.setBranch(request.branch().trim());
        app.setCurrentYear(request.currentYear().trim());
        app.setGraduationYear(request.graduationYear());
        app.setSkills(request.skills().trim());
        app.setResumeUrl(request.resumeUrl());
        app.setGithubUrl(request.githubUrl());
        app.setLinkedinUrl(request.linkedinUrl());
        app.setPortfolioUrl(request.portfolioUrl());
        app.setStatementOfPurpose(request.statementOfPurpose());
        app.setStatus("SUBMITTED");
        app.setAppliedAt(OffsetDateTime.now());
        app.setUpdatedAt(OffsetDateTime.now());

        InternshipApplicationEntity saved = applicationRepository.save(app);

        // Async / resilient dispatch of notifications & external tracking
        if (emailService != null) {
            try {
                // Confirmation email to candidate
                emailService.sendApplicationReceivedEmail(saved.getEmail(), saved.getFullName(), internship.getTitle(), saved.getReferenceNumber());
                // Notification to KaizenQ HR / Admin
                emailService.sendAdminApplicationNotification(null, saved.getFullName(), saved.getEmail(), internship.getTitle(),
                        saved.getReferenceNumber(), saved.getResumeUrl(), saved.getCollege(), saved.getBranch(),
                        saved.getGraduationYear(), saved.getSkills(), saved.getPhone());
            } catch (Exception e) {
                log.warn("[APPLICATION DISPATCH] Email notification failed for {}: {}", saved.getReferenceNumber(), e.getMessage());
            }
        }

        if (googleSheetsService != null) {
            try {
                googleSheetsService.syncApplication(saved, internship.getTitle());
            } catch (Exception e) {
                log.warn("[APPLICATION DISPATCH] Google Sheets sync failed for {}: {}", saved.getReferenceNumber(), e.getMessage());
            }
        }

        return toApplicationDTO(saved, internship.getTitle(), internship.getDomain(), null);
    }

    @Transactional
    public InternshipApplicationDTO withdrawApplication(String applicationId, WithdrawApplicationRequest request, UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        InternshipApplicationEntity app = applicationRepository.findByIdAndTenantId(applicationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        // Verify applicant ownership
        if (currentUser != null) {
            boolean isOwner = (app.getUserId() != null && app.getUserId().equals(currentUser.getId()))
                    || (currentUser.getUsername() != null && currentUser.getUsername().equalsIgnoreCase(app.getEmail()));
            if (!isOwner) {
                throw new ConflictException("You are not authorized to withdraw this application.");
            }
        }

        if ("WITHDRAWN".equalsIgnoreCase(app.getStatus())) {
            throw new ConflictException("Application is already withdrawn.");
        }
        if ("SELECTED".equalsIgnoreCase(app.getStatus()) || "REJECTED".equalsIgnoreCase(app.getStatus())) {
            throw new ConflictException("Cannot withdraw application that has already completed evaluation (" + app.getStatus() + ").");
        }

        app.setStatus("WITHDRAWN");
        app.setWithdrawalReason(request != null ? request.reason() : "Candidate initiated withdrawal");
        app.setWithdrawnAt(OffsetDateTime.now());
        app.setUpdatedAt(OffsetDateTime.now());

        InternshipApplicationEntity saved = applicationRepository.save(app);
        InternshipEntity intern = internshipRepository.findById(app.getInternshipId()).orElse(null);
        String title = intern != null ? intern.getTitle() : "Career Role";
        String domain = intern != null ? intern.getDomain() : "Technology";

        return toApplicationDTO(saved, title, domain, null);
    }

    @Transactional(readOnly = true)
    public List<InternshipApplicationDTO> getMyApplications(UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        List<InternshipApplicationEntity> apps = applicationRepository.findByTenantIdAndUserIdOrderByAppliedAtDesc(tenantId, currentUser.getId());
        if (apps.isEmpty() && currentUser.getUsername() != null) {
            apps = applicationRepository.findByTenantIdAndEmailIgnoreCaseOrderByAppliedAtDesc(tenantId, currentUser.getUsername());
        }

        if (apps.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> appIds = apps.stream().map(InternshipApplicationEntity::getId).toList();
        Map<String, InternshipInterviewEntity> interviewMap = interviewRepository.findByApplicationIdIn(appIds).stream()
                .collect(Collectors.toMap(InternshipInterviewEntity::getApplicationId, i -> i, (a, b) -> a));

        Map<String, InternshipEntity> internshipMap = internshipRepository.findAllById(
                apps.stream().map(InternshipApplicationEntity::getInternshipId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(InternshipEntity::getId, i -> i));

        return apps.stream().map(app -> {
            InternshipEntity intern = internshipMap.get(app.getInternshipId());
            String title = intern != null ? intern.getTitle() : "Internship";
            String domain = intern != null ? intern.getDomain() : "Technology";
            InterviewDTO interviewDTO = null;
            InternshipInterviewEntity interview = interviewMap.get(app.getId());
            if (interview != null) {
                interviewDTO = new InterviewDTO(
                        interview.getId(), interview.getApplicationId(), interview.getScheduledAt(),
                        interview.getMeetingLink(), interview.getInterviewerName(), interview.getRoundName(),
                        interview.getFeedback(), interview.getStatus()
                );
            }
            return toApplicationDTO(app, title, domain, interviewDTO);
        }).toList();
    }

    // =========================================================================
    // STUDENT ENROLLMENTS & TASK SUBMISSIONS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<InternshipEnrollmentDTO> getMyEnrollments(UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        List<InternshipEnrollmentEntity> enrollments = enrollmentRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, currentUser.getId());
        if (enrollments.isEmpty()) {
            return Collections.emptyList();
        }

        return enrollments.stream().map(enrollment -> {
            InternshipEntity intern = internshipRepository.findById(enrollment.getInternshipId()).orElse(null);
            String title = intern != null ? intern.getTitle() : "Internship";
            String domain = intern != null ? intern.getDomain() : "Technology";

            List<InternshipTaskEntity> tasks = taskRepository.findByInternshipIdOrderByDisplayOrderAsc(enrollment.getInternshipId());
            List<InternshipSubmissionEntity> submissions = submissionRepository.findByEnrollmentId(enrollment.getId());
            Map<String, InternshipSubmissionEntity> subMap = submissions.stream()
                    .collect(Collectors.toMap(InternshipSubmissionEntity::getTaskId, s -> s, (a, b) -> a));

            List<InternshipEnrollmentDTO.EnrollmentTaskSubmissionDTO> taskDTOs = tasks.stream().map(t -> {
                InternshipSubmissionEntity sub = subMap.get(t.getId());
                return new InternshipEnrollmentDTO.EnrollmentTaskSubmissionDTO(
                        t.getId(), t.getWeekNumber(), t.getTitle(), t.getDescription(),
                        t.getDeliverables(), t.getMaxScore(),
                        sub != null ? sub.getId() : null,
                        sub != null ? sub.getRepoUrl() : null,
                        sub != null ? sub.getLiveDemoUrl() : null,
                        sub != null ? sub.getNotes() : null,
                        sub != null ? sub.getScore() : null,
                        sub != null ? sub.getFeedback() : null,
                        sub != null ? sub.getStatus() : "PENDING",
                        sub != null ? sub.getSubmittedAt() : null
                );
            }).toList();

            return new InternshipEnrollmentDTO(
                    enrollment.getId(), enrollment.getInternshipId(), title, domain,
                    enrollment.getUserId(),
                    enrollment.getStatus(), enrollment.getStartDate(), enrollment.getEndDate(),
                    enrollment.getCompletionDate(), enrollment.getProgressPercentage(),
                    enrollment.getMentorNotes(), taskDTOs, enrollment.getCreatedAt()
            );
        }).toList();
    }

    @Transactional
    public InternshipEnrollmentDTO.EnrollmentTaskSubmissionDTO submitTaskDeliverable(
            String taskId, SubmitTaskRequest request, UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        InternshipEnrollmentEntity enrollment = enrollmentRepository.findById(request.enrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Internship enrollment not found."));

        if (!enrollment.getUserId().equals(currentUser.getId())) {
            throw new ConflictException("You are not authorized to submit deliverables for this enrollment.");
        }

        InternshipTaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));

        InternshipSubmissionEntity submission = submissionRepository.findByEnrollmentIdAndTaskId(enrollment.getId(), task.getId())
                .orElseGet(() -> {
                    InternshipSubmissionEntity s = new InternshipSubmissionEntity();
                    s.setId("sub-" + UUID.randomUUID().toString().substring(0, 8));
                    s.setEnrollmentId(enrollment.getId());
                    s.setTaskId(task.getId());
                    return s;
                });

        submission.setRepoUrl(request.repoUrl());
        submission.setLiveDemoUrl(request.liveDemoUrl());
        submission.setNotes(request.notes());
        submission.setStatus("SUBMITTED");
        submission.setSubmittedAt(OffsetDateTime.now());

        InternshipSubmissionEntity saved = submissionRepository.save(submission);

        // Recalculate progress percentage
        List<InternshipTaskEntity> allTasks = taskRepository.findByInternshipIdOrderByDisplayOrderAsc(enrollment.getInternshipId());
        long submittedCount = submissionRepository.findByEnrollmentId(enrollment.getId()).size();
        int progress = allTasks.isEmpty() ? 0 : (int) ((submittedCount * 100) / allTasks.size());
        enrollment.setProgressPercentage(Math.min(100, progress));
        enrollment.setUpdatedAt(OffsetDateTime.now());
        enrollmentRepository.save(enrollment);

        return new InternshipEnrollmentDTO.EnrollmentTaskSubmissionDTO(
                task.getId(), task.getWeekNumber(), task.getTitle(), task.getDescription(),
                task.getDeliverables(), task.getMaxScore(), saved.getId(), saved.getRepoUrl(),
                saved.getLiveDemoUrl(), saved.getNotes(), saved.getScore(), saved.getFeedback(),
                saved.getStatus(), saved.getSubmittedAt()
        );
    }

    // =========================================================================
    // CERTIFICATES
    // =========================================================================

    @Transactional(readOnly = true)
    public List<InternshipCertificateDTO> getMyCertificates(UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        return certificateRepository.findByTenantIdAndUserId(tenantId, currentUser.getId()).stream()
                .map(this::toCertificateDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public InternshipCertificateDTO verifyCertificate(String certificateNumber) {
        InternshipCertificateEntity cert = certificateRepository.findByCertificateNumber(certificateNumber.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No valid internship certificate found with number: " + certificateNumber));
        return toCertificateDTO(cert);
    }

    // =========================================================================
    // ADMIN / RECRUITER MANAGEMENT FEATURES
    // =========================================================================

    @Transactional(readOnly = true)
    public Page<InternshipDTO> adminGetInternships(Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return internshipRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable).map(this::toDTO);
    }

    @Transactional
    public InternshipDTO createInternship(CreateInternshipRequest req) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity entity = new InternshipEntity();
        entity.setId("int-" + UUID.randomUUID().toString().substring(0, 8));
        entity.setTenantId(tenantId);
        entity.setTitle(req.title().trim());
        entity.setSlug(req.slug().trim().toLowerCase());
        entity.setDomain(req.domain().trim());
        entity.setDepartment(req.department() != null ? req.department().trim() : "Engineering");
        entity.setEmploymentType(req.employmentType() != null ? req.employmentType() : "INTERNSHIP");
        entity.setExperienceLevel(req.experienceLevel() != null ? req.experienceLevel() : "ENTRY_LEVEL");
        entity.setInternshipType(req.internshipType() != null ? req.internshipType() : "REMOTE");
        entity.setDuration(req.duration() != null ? req.duration() : "12 Weeks");
        entity.setLocation(req.location() != null ? req.location() : "Remote, India");
        entity.setOpenings(req.openings() != null ? req.openings() : 5);
        entity.setDeadline(req.deadline());
        entity.setStipendType(req.stipendType() != null ? req.stipendType() : "PERFORMANCE_BASED");
        entity.setStipendAmount(req.stipendAmount());
        entity.setEligibility(req.eligibility());
        entity.setRequiredSkills(req.requiredSkills());
        entity.setPreferredSkills(req.preferredSkills());
        entity.setDescription(req.description());
        entity.setResponsibilities(req.responsibilities());
        entity.setLearningOutcomes(req.learningOutcomes());
        entity.setMentorName(req.mentorName());
        entity.setMentorTitle(req.mentorTitle());
        entity.setStatus(req.status() != null ? req.status().toUpperCase() : "OPEN");
        entity.setIsFeatured(req.isFeatured() != null ? req.isFeatured() : false);
        entity.setCreatedAt(OffsetDateTime.now());
        entity.setUpdatedAt(OffsetDateTime.now());

        return toDTO(internshipRepository.save(entity));
    }

    @Transactional
    public InternshipDTO updateInternship(String id, CreateInternshipRequest req) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity entity = internshipRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Career opening not found: " + id));

        entity.setTitle(req.title().trim());
        entity.setSlug(req.slug().trim().toLowerCase());
        entity.setDomain(req.domain().trim());
        if (req.department() != null) entity.setDepartment(req.department().trim());
        if (req.employmentType() != null) entity.setEmploymentType(req.employmentType());
        if (req.experienceLevel() != null) entity.setExperienceLevel(req.experienceLevel());
        if (req.internshipType() != null) entity.setInternshipType(req.internshipType());
        if (req.duration() != null) entity.setDuration(req.duration());
        if (req.location() != null) entity.setLocation(req.location());
        if (req.openings() != null) entity.setOpenings(req.openings());
        if (req.deadline() != null) entity.setDeadline(req.deadline());
        if (req.stipendType() != null) entity.setStipendType(req.stipendType());
        if (req.stipendAmount() != null) entity.setStipendAmount(req.stipendAmount());
        entity.setEligibility(req.eligibility());
        entity.setRequiredSkills(req.requiredSkills());
        if (req.preferredSkills() != null) entity.setPreferredSkills(req.preferredSkills());
        entity.setDescription(req.description());
        entity.setResponsibilities(req.responsibilities());
        entity.setLearningOutcomes(req.learningOutcomes());
        entity.setMentorName(req.mentorName());
        entity.setMentorTitle(req.mentorTitle());
        if (req.status() != null) entity.setStatus(req.status().toUpperCase());
        if (req.isFeatured() != null) entity.setIsFeatured(req.isFeatured());
        entity.setUpdatedAt(OffsetDateTime.now());

        return toDTO(internshipRepository.save(entity));
    }

    @Transactional
    public InternshipDTO patchInternshipStatus(String id, String status) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity entity = internshipRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Career opening not found: " + id));
        entity.setStatus(status.trim().toUpperCase());
        entity.setUpdatedAt(OffsetDateTime.now());
        return toDTO(internshipRepository.save(entity));
    }

    @Transactional
    public void deleteInternship(String id) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity entity = internshipRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found: " + id));
        internshipRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public Page<InternshipApplicationDTO> adminGetApplications(String internshipId, String status, String search, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        String internParam = (internshipId != null && !internshipId.trim().isEmpty() && !"ALL".equalsIgnoreCase(internshipId)) ? internshipId.trim() : null;
        String statusParam = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<InternshipApplicationEntity> apps = applicationRepository.searchApplications(
                tenantId, internParam, statusParam, searchParam, pageable
        );

        if (apps.isEmpty()) {
            return Page.empty(pageable);
        }

        List<String> appIds = apps.getContent().stream().map(InternshipApplicationEntity::getId).toList();
        Map<String, InternshipInterviewEntity> interviewMap = interviewRepository.findByApplicationIdIn(appIds).stream()
                .collect(Collectors.toMap(InternshipInterviewEntity::getApplicationId, i -> i, (a, b) -> a));

        Map<String, InternshipEntity> internshipMap = internshipRepository.findAllById(
                apps.getContent().stream().map(InternshipApplicationEntity::getInternshipId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(InternshipEntity::getId, i -> i));

        return apps.map(app -> {
            InternshipEntity intern = internshipMap.get(app.getInternshipId());
            String title = intern != null ? intern.getTitle() : "Internship";
            String domain = intern != null ? intern.getDomain() : "Technology";
            InterviewDTO interviewDTO = null;
            InternshipInterviewEntity interview = interviewMap.get(app.getId());
            if (interview != null) {
                interviewDTO = new InterviewDTO(
                        interview.getId(), interview.getApplicationId(), interview.getScheduledAt(),
                        interview.getMeetingLink(), interview.getInterviewerName(), interview.getRoundName(),
                        interview.getFeedback(), interview.getStatus()
                );
            }
            return toApplicationDTO(app, title, domain, interviewDTO);
        });
    }

    @Transactional
    public InternshipApplicationDTO adminUpdateApplicationStatus(String applicationId, UpdateApplicationStatusRequest req) {
        String tenantId = TenantContext.getTenantId();
        InternshipApplicationEntity app = applicationRepository.findByIdAndTenantId(applicationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        app.setStatus(req.status().trim().toUpperCase());
        if (req.adminNotes() != null) {
            app.setAdminNotes(req.adminNotes().trim());
        }
        app.setUpdatedAt(OffsetDateTime.now());

        InternshipApplicationEntity saved = applicationRepository.save(app);
        InternshipEntity intern = internshipRepository.findById(saved.getInternshipId()).orElse(null);
        String title = intern != null ? intern.getTitle() : "Internship";
        String domain = intern != null ? intern.getDomain() : "Technology";

        InterviewDTO interviewDTO = interviewRepository.findByApplicationId(saved.getId())
                .map(i -> new InterviewDTO(
                        i.getId(), i.getApplicationId(), i.getScheduledAt(), i.getMeetingLink(),
                        i.getInterviewerName(), i.getRoundName(), i.getFeedback(), i.getStatus()
                )).orElse(null);

        return toApplicationDTO(saved, title, domain, interviewDTO);
    }

    @Transactional(readOnly = true)
    public String adminExportApplicationsCsv(String internshipId, String status) {
        String tenantId = TenantContext.getTenantId();
        List<InternshipApplicationEntity> list;
        if (internshipId != null && !internshipId.trim().isEmpty() && !"ALL".equalsIgnoreCase(internshipId)) {
            list = applicationRepository.findByTenantIdAndInternshipIdOrderByAppliedAtDesc(tenantId, internshipId.trim());
        } else {
            list = applicationRepository.findByTenantIdOrderByAppliedAtDesc(tenantId);
        }

        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            list = list.stream().filter(a -> status.equalsIgnoreCase(a.getStatus())).toList();
        }

        Map<String, InternshipEntity> internMap = internshipRepository.findAll().stream()
                .collect(Collectors.toMap(InternshipEntity::getId, i -> i, (a, b) -> a));

        StringBuilder sb = new StringBuilder();
        sb.append("Reference Number,Candidate Name,Email,Phone,Role Title,Department,College,Degree,Branch,Current Year,Graduation Year,Status,Applied Date,Resume URL,GitHub,LinkedIn,Portfolio,Admin Notes\n");

        for (InternshipApplicationEntity a : list) {
            InternshipEntity intern = internMap.get(a.getInternshipId());
            String roleTitle = intern != null ? intern.getTitle() : "Career Role";
            String dept = intern != null ? intern.getDepartment() : "Engineering";

            sb.append(escapeCsv(a.getReferenceNumber())).append(",")
              .append(escapeCsv(a.getFullName())).append(",")
              .append(escapeCsv(a.getEmail())).append(",")
              .append(escapeCsv(a.getPhone())).append(",")
              .append(escapeCsv(roleTitle)).append(",")
              .append(escapeCsv(dept)).append(",")
              .append(escapeCsv(a.getCollege())).append(",")
              .append(escapeCsv(a.getDegree())).append(",")
              .append(escapeCsv(a.getBranch())).append(",")
              .append(escapeCsv(a.getCurrentYear())).append(",")
              .append(a.getGraduationYear() != null ? a.getGraduationYear() : "").append(",")
              .append(escapeCsv(a.getStatus())).append(",")
              .append(a.getAppliedAt() != null ? a.getAppliedAt().toString() : "").append(",")
              .append(escapeCsv(a.getResumeUrl())).append(",")
              .append(escapeCsv(a.getGithubUrl())).append(",")
              .append(escapeCsv(a.getLinkedinUrl())).append(",")
              .append(escapeCsv(a.getPortfolioUrl())).append(",")
              .append(escapeCsv(a.getAdminNotes())).append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "\"\"";
        return "\"" + val.replace("\"", "\"\"").replace("\n", " ") + "\"";
    }

    @Transactional
    public InterviewDTO adminScheduleInterview(String applicationId, ScheduleInterviewRequest req) {
        InternshipApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        InternshipInterviewEntity interview = interviewRepository.findByApplicationId(app.getId())
                .orElseGet(() -> {
                    InternshipInterviewEntity i = new InternshipInterviewEntity();
                    i.setId("intv-" + UUID.randomUUID().toString().substring(0, 8));
                    i.setApplicationId(app.getId());
                    return i;
                });

        interview.setScheduledAt(req.scheduledAt());
        interview.setMeetingLink(req.meetingLink());
        interview.setInterviewerName(req.interviewerName() != null ? req.interviewerName() : "KaizenQ Interview Panel");
        interview.setRoundName(req.roundName() != null ? req.roundName() : "Technical Assessment & Culture Fit");
        interview.setStatus("SCHEDULED");
        InternshipInterviewEntity saved = interviewRepository.save(interview);

        app.setStatus("INTERVIEW");
        applicationRepository.save(app);

        return new InterviewDTO(
                saved.getId(), saved.getApplicationId(), saved.getScheduledAt(),
                saved.getMeetingLink(), saved.getInterviewerName(), saved.getRoundName(),
                saved.getFeedback(), saved.getStatus()
        );
    }

    @Transactional
    public InternshipEnrollmentDTO adminEnrollCandidate(String applicationId) {
        InternshipApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (app.getUserId() == null) {
            throw new ConflictException("Cannot enroll applicant: No registered student account linked with email " + app.getEmail());
        }

        Optional<InternshipEnrollmentEntity> existing = enrollmentRepository.findByInternshipIdAndUserId(app.getInternshipId(), app.getUserId());
        if (existing.isPresent()) {
            throw new ConflictException("Student is already actively enrolled in this internship program.");
        }

        InternshipEnrollmentEntity enrollment = new InternshipEnrollmentEntity();
        enrollment.setId("enr-" + UUID.randomUUID().toString().substring(0, 8));
        enrollment.setInternshipId(app.getInternshipId());
        enrollment.setApplicationId(app.getId());
        enrollment.setUserId(app.getUserId());
        enrollment.setTenantId(app.getTenantId());
        enrollment.setStatus("ACTIVE");
        enrollment.setStartDate(LocalDate.now());
        enrollment.setEndDate(LocalDate.now().plusWeeks(12));
        enrollment.setProgressPercentage(0);

        InternshipEnrollmentEntity saved = enrollmentRepository.save(enrollment);
        app.setStatus("SELECTED");
        applicationRepository.save(app);

        InternshipEntity intern = internshipRepository.findById(saved.getInternshipId()).orElse(null);
        String title = intern != null ? intern.getTitle() : "Internship";
        String domain = intern != null ? intern.getDomain() : "Technology";

        return new InternshipEnrollmentDTO(
                saved.getId(), saved.getInternshipId(), title, domain,
                saved.getUserId(),
                saved.getStatus(), saved.getStartDate(), saved.getEndDate(),
                saved.getCompletionDate(), saved.getProgressPercentage(),
                saved.getMentorNotes(), Collections.emptyList(), saved.getCreatedAt()
        );
    }

    @Transactional
    public InternshipCertificateDTO adminCompleteEnrollmentAndIssueCertificate(String enrollmentId) {
        InternshipEnrollmentEntity enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found."));

        enrollment.setStatus("COMPLETED");
        enrollment.setCompletionDate(LocalDate.now());
        enrollment.setProgressPercentage(100);
        enrollmentRepository.save(enrollment);

        InternshipEntity intern = internshipRepository.findById(enrollment.getInternshipId())
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found."));

        InternshipApplicationEntity app = enrollment.getApplicationId() != null
                ? applicationRepository.findById(enrollment.getApplicationId()).orElse(null)
                : null;

        String studentName = (app != null) ? app.getFullName() : "Internship Scholar";

        // Generate unique certificate number: KQ-INT-2026-XXXX
        String certNumber = "KQ-INT-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String verificationHash = sha256Hex(certNumber + ":" + enrollment.getUserId() + ":" + intern.getTitle());

        InternshipCertificateEntity cert = certificateRepository.findByEnrollmentId(enrollment.getId())
                .orElseGet(() -> {
                    InternshipCertificateEntity c = new InternshipCertificateEntity();
                    c.setId("cert-" + UUID.randomUUID().toString().substring(0, 8));
                    c.setEnrollmentId(enrollment.getId());
                    c.setUserId(enrollment.getUserId());
                    c.setTenantId(enrollment.getTenantId());
                    c.setCertificateNumber(certNumber);
                    c.setStudentName(studentName);
                    c.setInternshipTitle(intern.getTitle());
                    c.setDomain(intern.getDomain());
                    c.setDuration(intern.getDuration());
                    c.setIssueDate(LocalDate.now());
                    c.setVerificationHash(verificationHash);
                    c.setStatus("VALID");
                    return c;
                });

        return toCertificateDTO(certificateRepository.save(cert));
    }

    @Transactional(readOnly = true)
    public InternshipAnalyticsDTO adminGetAnalytics() {
        String tenantId = TenantContext.getTenantId();
        long totalInternships = internshipRepository.countByTenantId(tenantId);
        long openInternships = internshipRepository.countByTenantIdAndStatus(tenantId, "OPEN") + internshipRepository.countByTenantIdAndStatus(tenantId, "PUBLISHED");
        long totalApplications = applicationRepository.countByTenantId(tenantId);
        long underReview = applicationRepository.countByTenantIdAndStatus(tenantId, "UNDER_REVIEW");
        long shortlisted = applicationRepository.countByTenantIdAndStatus(tenantId, "SHORTLISTED");
        long selected = applicationRepository.countByTenantIdAndStatus(tenantId, "SELECTED");
        long activeEnrollments = enrollmentRepository.countByTenantIdAndStatus(tenantId, "ACTIVE");
        long completedEnrollments = enrollmentRepository.countByTenantIdAndStatus(tenantId, "COMPLETED");

        Map<String, Long> domainCounts = new HashMap<>();
        List<InternshipEntity> allInterns = internshipRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, Pageable.unpaged()).getContent();
        for (InternshipEntity i : allInterns) {
            domainCounts.put(i.getDomain(), domainCounts.getOrDefault(i.getDomain(), 0L) + 1);
        }

        return new InternshipAnalyticsDTO(
                totalInternships, openInternships, totalApplications, underReview,
                shortlisted, selected, activeEnrollments, completedEnrollments, domainCounts
        );
    }

    // =========================================================================
    // HELPERS & MAPPERS
    // =========================================================================

    private InternshipDTO toDTO(InternshipEntity e) {
        return new InternshipDTO(
                e.getId(), e.getTitle(), e.getSlug(), e.getDomain(), e.getDepartment(),
                e.getEmploymentType(), e.getExperienceLevel(), e.getInternshipType(),
                e.getDuration(), e.getLocation(), e.getOpenings(), e.getDeadline(),
                e.getStipendType(), e.getStipendAmount(), e.getEligibility(), e.getRequiredSkills(),
                e.getPreferredSkills(), e.getDescription(), e.getMentorName(), e.getMentorTitle(),
                e.getStatus(), e.getIsFeatured(), e.getCreatedAt()
        );
    }

    private InternshipApplicationDTO toApplicationDTO(InternshipApplicationEntity e, String internshipTitle, String domain, InterviewDTO interview) {
        return new InternshipApplicationDTO(
                e.getId(), e.getReferenceNumber(), e.getInternshipId(), internshipTitle, domain, e.getUserId(),
                e.getFullName(), e.getEmail(), e.getPhone(), e.getCollege(), e.getDegree(),
                e.getBranch(), e.getCurrentYear(), e.getGraduationYear(), e.getSkills(),
                e.getResumeUrl(), e.getGithubUrl(), e.getLinkedinUrl(), e.getPortfolioUrl(),
                e.getStatementOfPurpose(), e.getStatus(), e.getAdminNotes(),
                e.getWithdrawalReason(), e.getWithdrawnAt(), interview, e.getAppliedAt()
        );
    }

    private InternshipCertificateDTO toCertificateDTO(InternshipCertificateEntity c) {
        String verificationUrl = "https://www.kaizenq.in/verify-certificate/" + c.getCertificateNumber();
        return new InternshipCertificateDTO(
                c.getId(), c.getEnrollmentId(), c.getUserId(), c.getCertificateNumber(),
                c.getStudentName(), c.getInternshipTitle(), c.getDomain(), c.getDuration(),
                c.getIssueDate(), c.getVerificationHash(), verificationUrl, c.getPdfUrl(),
                c.getStatus(), c.getCreatedAt()
        );
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
