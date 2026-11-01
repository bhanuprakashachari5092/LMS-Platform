package com.shaivikagroups.lms.assignment;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentById(id)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentsByCourse(courseId)));
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentByLesson(@PathVariable String lessonId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAssignmentByLesson(lessonId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        AssignmentResponse response = assignmentService.saveAssignment(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Assignment created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @PathVariable String id,
            @Valid @RequestBody AssignmentRequest request) {
        AssignmentResponse response = assignmentService.saveAssignment(request, id);
        return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable String id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment deleted successfully"));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitAssignment(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SubmissionRequest request) {
        SubmissionResponse response = assignmentService.submitAssignment(id, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Assignment submitted successfully", response));
    }

    @GetMapping("/{id}/my-submission")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getMySubmission(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getStudentSubmission(id, principal.getId())));
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsForAssignment(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSubmissionsForAssignment(id)));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> gradeSubmission(
            @PathVariable String submissionId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GradeSubmissionRequest request) {
        SubmissionResponse response = assignmentService.gradeSubmission(submissionId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Submission graded successfully", response));
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getMySubmissions(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getStudentSubmissions(principal.getId())));
    }
}

