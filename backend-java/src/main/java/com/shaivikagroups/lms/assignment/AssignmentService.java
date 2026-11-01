package com.shaivikagroups.lms.assignment;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.enrollment.EnrollmentRepository;
import com.shaivikagroups.lms.progress.ProgressService;
import com.shaivikagroups.lms.progress.ProgressUpdateRequest;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressService progressService;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository submissionRepository,
            EnrollmentRepository enrollmentRepository,
            ProgressService progressService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.progressService = progressService;
    }

    @Transactional
    public AssignmentResponse saveAssignment(AssignmentRequest req, String existingId) {
        AssignmentEntity entity;
        if (existingId != null && !existingId.isBlank()) {
            entity = assignmentRepository.findById(existingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + existingId));
        } else {
            entity = new AssignmentEntity();
            entity.setId("asg_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        }

        entity.setCourseId(req.getCourseId());
        entity.setLessonId(req.getLessonId());
        entity.setTitle(req.getTitle());
        entity.setInstructions(req.getInstructions());
        entity.setMaxScore(req.getMaxScore() > 0 ? req.getMaxScore() : 100);
        entity.setDueDate(req.getDueDate());
        entity.setAllowFileUpload(req.isAllowFileUpload());
        entity.setAllowGithubLink(req.isAllowGithubLink());
        entity.setUpdatedAt(Instant.now());

        AssignmentEntity saved = assignmentRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(String id) {
        AssignmentEntity entity = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + id));
        return mapToResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByCourse(String courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentByLesson(String lessonId) {
        AssignmentEntity entity = assignmentRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for lesson: " + lessonId));
        return mapToResponse(entity);
    }

    @Transactional
    public void deleteAssignment(String id) {
        if (!assignmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assignment not found: " + id);
        }
        assignmentRepository.deleteById(id);
    }

    @Transactional
    public SubmissionResponse submitAssignment(String assignmentId, String userId, SubmissionRequest req) {
        String tenantId = TenantContext.getTenantId();
        AssignmentEntity assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        AssignmentSubmissionEntity submission = submissionRepository
                .findByTenantIdAndUserIdAndAssignmentId(tenantId, userId, assignmentId)
                .orElseGet(() -> {
                    AssignmentSubmissionEntity s = new AssignmentSubmissionEntity();
                    s.setId("sub_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
                    s.setTenantId(tenantId);
                    s.setUserId(userId);
                    s.setAssignmentId(assignmentId);
                    return s;
                });

        submission.setSubmissionUrl(req.getSubmissionUrl());
        submission.setNotes(req.getNotes());
        submission.setStatus(SubmissionStatus.PENDING);
        submission.setSubmittedAt(Instant.now());

        AssignmentSubmissionEntity saved = submissionRepository.save(submission);
        return mapToSubmissionResponse(saved);
    }

    @Transactional
    public SubmissionResponse gradeSubmission(String submissionId, String graderUserId, GradeSubmissionRequest req) {
        AssignmentSubmissionEntity submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        AssignmentEntity assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated assignment not found"));

        if (req.getScore() > assignment.getMaxScore()) {
            throw new BadRequestException("Score (" + req.getScore() + ") cannot exceed max score (" + assignment.getMaxScore() + ")");
        }

        submission.setScore(req.getScore());
        submission.setFeedback(req.getFeedback());
        submission.setGradedByUserId(graderUserId);
        submission.setGradedAt(Instant.now());

        SubmissionStatus status;
        try {
            status = SubmissionStatus.valueOf(req.getStatus().toUpperCase());
        } catch (Exception e) {
            status = SubmissionStatus.GRADED;
        }
        submission.setStatus(status);

        AssignmentSubmissionEntity saved = submissionRepository.save(submission);

        // If passing grade (e.g. >= 50%) and lessonId exists, update student progress if enrolled
        boolean isPassing = req.getScore() >= (assignment.getMaxScore() * 0.5);
        if (isPassing && status == SubmissionStatus.GRADED && assignment.getLessonId() != null) {
            String tenantId = TenantContext.getTenantId();
            if (enrollmentRepository.findByTenantIdAndUserIdAndCourseId(tenantId, submission.getUserId(), assignment.getCourseId()).isPresent()) {
                try {
                    progressService.updateLessonProgress(submission.getUserId(), assignment.getCourseId(),
                            new ProgressUpdateRequest(assignment.getLessonId(), "COMPLETED", 300));
                } catch (Exception e) {
                    // Log and continue
                }
            }
        }

        return mapToSubmissionResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsForAssignment(String assignmentId) {
        String tenantId = TenantContext.getTenantId();
        return submissionRepository.findByTenantIdAndAssignmentId(tenantId, assignmentId).stream()
                .map(this::mapToSubmissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getStudentSubmission(String assignmentId, String userId) {
        String tenantId = TenantContext.getTenantId();
        AssignmentSubmissionEntity entity = submissionRepository
                .findByTenantIdAndUserIdAndAssignmentId(tenantId, userId, assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No submission found for this assignment"));
        return mapToSubmissionResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getStudentSubmissions(String userId) {
        String tenantId = TenantContext.getTenantId();
        return submissionRepository.findByTenantIdAndUserId(tenantId, userId).stream()
                .map(this::mapToSubmissionResponse)
                .collect(Collectors.toList());
    }

    private AssignmentResponse mapToResponse(AssignmentEntity entity) {
        AssignmentResponse resp = new AssignmentResponse();
        resp.setId(entity.getId());
        resp.setCourseId(entity.getCourseId());
        resp.setLessonId(entity.getLessonId());
        resp.setTitle(entity.getTitle());
        resp.setInstructions(entity.getInstructions());
        resp.setMaxScore(entity.getMaxScore());
        resp.setDueDate(entity.getDueDate());
        resp.setAllowFileUpload(entity.isAllowFileUpload());
        resp.setAllowGithubLink(entity.isAllowGithubLink());
        resp.setCreatedAt(entity.getCreatedAt());
        return resp;
    }

    private SubmissionResponse mapToSubmissionResponse(AssignmentSubmissionEntity entity) {
        SubmissionResponse resp = new SubmissionResponse();
        resp.setId(entity.getId());
        resp.setAssignmentId(entity.getAssignmentId());
        resp.setUserId(entity.getUserId());
        resp.setSubmissionUrl(entity.getSubmissionUrl());
        resp.setNotes(entity.getNotes());
        resp.setScore(entity.getScore());
        resp.setFeedback(entity.getFeedback());
        resp.setGradedByUserId(entity.getGradedByUserId());
        resp.setGradedAt(entity.getGradedAt());
        resp.setStatus(entity.getStatus().name());
        resp.setSubmittedAt(entity.getSubmittedAt());
        return resp;
    }
}
