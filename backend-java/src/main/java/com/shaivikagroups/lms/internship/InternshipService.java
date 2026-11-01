package com.shaivikagroups.lms.internship;

import com.shaivikagroups.lms.common.ConflictException;
import com.shaivikagroups.lms.common.ForbiddenException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.internship.dto.*;
import com.shaivikagroups.lms.security.UserPrincipal;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InternshipService {

    private final InternshipRepository internshipRepository;
    private final InternshipApplicationRepository applicationRepository;
    private final InternshipInterviewRepository interviewRepository;
    private final InternshipEnrollmentRepository enrollmentRepository;
    private final InternshipTaskRepository taskRepository;
    private final InternshipSubmissionRepository submissionRepository;
    private final InternshipCertificateRepository certificateRepository;

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
    // PUBLIC & STUDENT BROWSING
    // =========================================================================

    @Transactional(readOnly = true)
    public Page<InternshipDTO> getOpenInternships(String domain, String type, String search, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        String domainParam = (domain != null && !domain.trim().isEmpty() && !"ALL".equalsIgnoreCase(domain)) ? domain.trim() : null;
        String typeParam = (type != null && !type.trim().isEmpty() && !"ALL".equalsIgnoreCase(type)) ? type.trim() : null;

        Page<InternshipEntity> pageResult;
        if (domainParam != null) {
            pageResult = internshipRepository.findByTenantIdAndStatusAndDomain(tenantId, "OPEN", domainParam, pageable);
        } else if (typeParam != null) {
            pageResult = internshipRepository.findByTenantIdAndStatusAndInternshipType(tenantId, "OPEN", typeParam, pageable);
        } else {
            pageResult = internshipRepository.findByTenantIdAndStatus(tenantId, "OPEN", pageable);
        }
        return pageResult.map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public InternshipDetailDTO getInternshipDetail(String slugOrId) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity entity = internshipRepository.findByTenantIdAndSlug(tenantId, slugOrId)
                .or(() -> internshipRepository.findByTenantIdAndId(tenantId, slugOrId))
                .orElseThrow(() -> new ResourceNotFoundException("Internship program not found with identifier: " + slugOrId));

        List<InternshipTaskEntity> tasks = taskRepository.findByInternshipIdOrderByDisplayOrderAsc(entity.getId());
        List<InternshipDetailDTO.InternshipTaskDTO> taskDTOs = tasks.stream()
                .map(t -> new InternshipDetailDTO.InternshipTaskDTO(
                        t.getId(), t.getWeekNumber(), t.getTitle(), t.getDescription(),
                        t.getDeliverables(), t.getMaxScore(), t.getDisplayOrder()
                ))
                .toList();

        return new InternshipDetailDTO(
                entity.getId(), entity.getTitle(), entity.getSlug(), entity.getDomain(),
                entity.getInternshipType(), entity.getDuration(), entity.getLocation(),
                entity.getOpenings(), entity.getDeadline(), entity.getStipendType(),
                entity.getStipendAmount(), entity.getEligibility(), entity.getRequiredSkills(),
                entity.getDescription(), entity.getResponsibilities(), entity.getLearningOutcomes(),
                entity.getMentorName(), entity.getMentorTitle(), entity.getStatus(),
                entity.getIsFeatured(), entity.getCreatedAt(), taskDTOs
        );
    }

    // =========================================================================
    // APPLICATION SUBMISSION & TRACKING
    // =========================================================================

    @Transactional
    public InternshipApplicationDTO submitApplication(SubmitApplicationRequest request, UserPrincipal currentUser) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity internship = internshipRepository.findById(request.internshipId())
                .orElseThrow(() -> new ResourceNotFoundException("Internship program not found."));

        // Duplicate Check: Prevent multiple applications for same internship by same email
        if (applicationRepository.existsByInternshipIdAndEmailIgnoreCase(internship.getId(), request.email().trim())) {
            throw new ConflictException("You have already submitted an application for this internship program. You can track your status in your dashboard.");
        }

        InternshipApplicationEntity app = new InternshipApplicationEntity();
        app.setId("app-" + UUID.randomUUID().toString().substring(0, 8));
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
        return toApplicationDTO(saved, internship.getTitle(), internship.getDomain(), null);
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
            String title = intern != null ? intern.getTitle() : "Internship Program";
            String domain = intern != null ? intern.getDomain() : "Technology";

            List<InternshipTaskEntity> tasks = taskRepository.findByInternshipIdOrderByDisplayOrderAsc(enrollment.getInternshipId());
            Map<String, InternshipSubmissionEntity> subMap = submissionRepository.findByEnrollmentId(enrollment.getId()).stream()
                    .collect(Collectors.toMap(InternshipSubmissionEntity::getTaskId, s -> s, (a, b) -> a));

            List<InternshipEnrollmentDTO.EnrollmentTaskSubmissionDTO> taskList = tasks.stream().map(t -> {
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
                    enrollment.getUserId(), enrollment.getStatus(), enrollment.getStartDate(),
                    enrollment.getEndDate(), enrollment.getCompletionDate(),
                    enrollment.getProgressPercentage(), enrollment.getMentorNotes(), taskList
            );
        }).toList();
    }

    @Transactional
    public InternshipEnrollmentDTO.EnrollmentTaskSubmissionDTO submitTask(String taskId, SubmitTaskRequest request, UserPrincipal currentUser) {
        InternshipEnrollmentEntity enrollment = enrollmentRepository.findById(request.enrollmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found."));

        if (!enrollment.getUserId().equals(currentUser.getId())) {
            throw new ForbiddenException("You cannot submit tasks for another student's enrollment.");
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
    // ADMIN MANAGEMENT FEATURES
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
        entity.setInternshipType(req.internshipType() != null ? req.internshipType() : "REMOTE");
        entity.setDuration(req.duration() != null ? req.duration() : "12 Weeks");
        entity.setLocation(req.location() != null ? req.location() : "Remote, India");
        entity.setOpenings(req.openings() != null ? req.openings() : 5);
        entity.setDeadline(req.deadline());
        entity.setStipendType(req.stipendType() != null ? req.stipendType() : "PERFORMANCE_BASED");
        entity.setStipendAmount(req.stipendAmount());
        entity.setEligibility(req.eligibility());
        entity.setRequiredSkills(req.requiredSkills());
        entity.setDescription(req.description());
        entity.setResponsibilities(req.responsibilities());
        entity.setLearningOutcomes(req.learningOutcomes());
        entity.setMentorName(req.mentorName());
        entity.setMentorTitle(req.mentorTitle());
        entity.setStatus(req.status() != null ? req.status() : "OPEN");
        entity.setIsFeatured(req.isFeatured() != null ? req.isFeatured() : false);
        entity.setCreatedAt(OffsetDateTime.now());
        entity.setUpdatedAt(OffsetDateTime.now());

        return toDTO(internshipRepository.save(entity));
    }

    @Transactional
    public InternshipDTO updateInternship(String id, CreateInternshipRequest req) {
        String tenantId = TenantContext.getTenantId();
        InternshipEntity entity = internshipRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found: " + id));

        entity.setTitle(req.title().trim());
        entity.setSlug(req.slug().trim().toLowerCase());
        entity.setDomain(req.domain().trim());
        if (req.internshipType() != null) entity.setInternshipType(req.internshipType());
        if (req.duration() != null) entity.setDuration(req.duration());
        if (req.location() != null) entity.setLocation(req.location());
        if (req.openings() != null) entity.setOpenings(req.openings());
        if (req.deadline() != null) entity.setDeadline(req.deadline());
        if (req.stipendType() != null) entity.setStipendType(req.stipendType());
        if (req.stipendAmount() != null) entity.setStipendAmount(req.stipendAmount());
        entity.setEligibility(req.eligibility());
        entity.setRequiredSkills(req.requiredSkills());
        entity.setDescription(req.description());
        entity.setResponsibilities(req.responsibilities());
        entity.setLearningOutcomes(req.learningOutcomes());
        entity.setMentorName(req.mentorName());
        entity.setMentorTitle(req.mentorTitle());
        if (req.status() != null) entity.setStatus(req.status());
        if (req.isFeatured() != null) entity.setIsFeatured(req.isFeatured());
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

        Page<InternshipApplicationEntity> apps;
        if (statusParam != null) {
            apps = applicationRepository.findByTenantIdAndStatusOrderByAppliedAtDesc(tenantId, statusParam, pageable);
        } else if (internParam != null) {
            apps = applicationRepository.findByTenantIdAndInternshipIdOrderByAppliedAtDesc(tenantId, internParam, pageable);
        } else {
            apps = applicationRepository.findByTenantIdOrderByAppliedAtDesc(tenantId, pageable);
        }

        Map<String, InternshipEntity> internMap = internshipRepository.findAllById(
                apps.getContent().stream().map(InternshipApplicationEntity::getInternshipId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(InternshipEntity::getId, i -> i));

        List<String> appIds = apps.getContent().stream().map(InternshipApplicationEntity::getId).toList();
        Map<String, InternshipInterviewEntity> interviewMap = interviewRepository.findByApplicationIdIn(appIds).stream()
                .collect(Collectors.toMap(InternshipInterviewEntity::getApplicationId, i -> i, (a, b) -> a));

        return apps.map(app -> {
            InternshipEntity intern = internMap.get(app.getInternshipId());
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
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));

        app.setStatus(req.status().trim().toUpperCase());
        if (req.adminNotes() != null) {
            app.setAdminNotes(req.adminNotes());
        }
        app.setUpdatedAt(OffsetDateTime.now());
        InternshipApplicationEntity saved = applicationRepository.save(app);

        InternshipEntity intern = internshipRepository.findById(saved.getInternshipId()).orElse(null);
        String title = intern != null ? intern.getTitle() : "Internship";
        String domain = intern != null ? intern.getDomain() : "Technology";

        InterviewDTO interviewDTO = interviewRepository.findByApplicationId(saved.getId())
                .map(i -> new InterviewDTO(i.getId(), i.getApplicationId(), i.getScheduledAt(), i.getMeetingLink(), i.getInterviewerName(), i.getRoundName(), i.getFeedback(), i.getStatus()))
                .orElse(null);

        return toApplicationDTO(saved, title, domain, interviewDTO);
    }

    @Transactional
    public InterviewDTO adminScheduleInterview(String applicationId, ScheduleInterviewRequest req) {
        String tenantId = TenantContext.getTenantId();
        InternshipApplicationEntity app = applicationRepository.findByIdAndTenantId(applicationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));

        InternshipInterviewEntity interview = interviewRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    InternshipInterviewEntity i = new InternshipInterviewEntity();
                    i.setId("intv-" + UUID.randomUUID().toString().substring(0, 8));
                    i.setApplicationId(applicationId);
                    return i;
                });

        interview.setScheduledAt(req.scheduledAt());
        interview.setMeetingLink(req.meetingLink());
        if (req.interviewerName() != null) interview.setInterviewerName(req.interviewerName());
        if (req.roundName() != null) interview.setRoundName(req.roundName());
        interview.setStatus("SCHEDULED");

        InternshipInterviewEntity saved = interviewRepository.save(interview);

        // Update application status to INTERVIEW_SCHEDULED
        app.setStatus("INTERVIEW_SCHEDULED");
        app.setUpdatedAt(OffsetDateTime.now());
        applicationRepository.save(app);

        return new InterviewDTO(
                saved.getId(), saved.getApplicationId(), saved.getScheduledAt(),
                saved.getMeetingLink(), saved.getInterviewerName(), saved.getRoundName(),
                saved.getFeedback(), saved.getStatus()
        );
    }

    @Transactional
    public InternshipEnrollmentDTO adminEnrollStudent(String applicationId) {
        String tenantId = TenantContext.getTenantId();
        InternshipApplicationEntity app = applicationRepository.findByIdAndTenantId(applicationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found."));

        String targetUserId = app.getUserId() != null ? app.getUserId() : "user-" + app.getId();

        InternshipEnrollmentEntity enrollment = enrollmentRepository.findByInternshipIdAndUserId(app.getInternshipId(), targetUserId)
                .orElseGet(() -> {
                    InternshipEnrollmentEntity e = new InternshipEnrollmentEntity();
                    e.setId("enr-" + UUID.randomUUID().toString().substring(0, 8));
                    e.setInternshipId(app.getInternshipId());
                    e.setApplicationId(app.getId());
                    e.setUserId(targetUserId);
                    e.setTenantId(tenantId);
                    e.setStatus("ACTIVE");
                    e.setStartDate(LocalDate.now());
                    e.setProgressPercentage(0);
                    return e;
                });

        InternshipEnrollmentEntity saved = enrollmentRepository.save(enrollment);

        // Mark application as SELECTED
        app.setStatus("SELECTED");
        applicationRepository.save(app);

        InternshipEntity intern = internshipRepository.findById(saved.getInternshipId()).orElse(null);
        String title = intern != null ? intern.getTitle() : "Internship";
        String domain = intern != null ? intern.getDomain() : "Technology";

        return new InternshipEnrollmentDTO(
                saved.getId(), saved.getInternshipId(), title, domain, saved.getUserId(),
                saved.getStatus(), saved.getStartDate(), saved.getEndDate(), saved.getCompletionDate(),
                saved.getProgressPercentage(), saved.getMentorNotes(), Collections.emptyList()
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
        long totalInternships = internshipRepository.count();
        long openInternships = internshipRepository.countByTenantIdAndStatus(tenantId, "OPEN");
        long totalApplications = applicationRepository.countByTenantId(tenantId);
        long underReview = applicationRepository.countByTenantIdAndStatus(tenantId, "UNDER_REVIEW");
        long shortlisted = applicationRepository.countByTenantIdAndStatus(tenantId, "SHORTLISTED");
        long selected = applicationRepository.countByTenantIdAndStatus(tenantId, "SELECTED");
        long activeEnrollments = enrollmentRepository.countByTenantIdAndStatus(tenantId, "ACTIVE");
        long completedEnrollments = enrollmentRepository.countByTenantIdAndStatus(tenantId, "COMPLETED");

        Map<String, Long> domainCounts = new HashMap<>();
        List<InternshipEntity> allInterns = internshipRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, "OPEN");
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
                e.getId(), e.getTitle(), e.getSlug(), e.getDomain(), e.getInternshipType(),
                e.getDuration(), e.getLocation(), e.getOpenings(), e.getDeadline(),
                e.getStipendType(), e.getStipendAmount(), e.getEligibility(), e.getRequiredSkills(),
                e.getDescription(), e.getMentorName(), e.getMentorTitle(), e.getStatus(),
                e.getIsFeatured(), e.getCreatedAt()
        );
    }

    private InternshipApplicationDTO toApplicationDTO(InternshipApplicationEntity e, String internshipTitle, String domain, InterviewDTO interview) {
        return new InternshipApplicationDTO(
                e.getId(), e.getInternshipId(), internshipTitle, domain, e.getUserId(),
                e.getFullName(), e.getEmail(), e.getPhone(), e.getCollege(), e.getDegree(),
                e.getBranch(), e.getCurrentYear(), e.getGraduationYear(), e.getSkills(),
                e.getResumeUrl(), e.getGithubUrl(), e.getLinkedinUrl(), e.getPortfolioUrl(),
                e.getStatementOfPurpose(), e.getStatus(), e.getAdminNotes(), interview, e.getAppliedAt()
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
            byte[] hash = md.digest(input.getBytes());
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
