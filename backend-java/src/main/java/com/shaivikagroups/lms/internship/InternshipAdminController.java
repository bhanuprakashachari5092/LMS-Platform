package com.shaivikagroups.lms.internship;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.internship.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/internships")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
public class InternshipAdminController {

    private final InternshipService internshipService;

    public InternshipAdminController(InternshipService internshipService) {
        this.internshipService = internshipService;
    }

    /**
     * Lists all internships for administrative management.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<InternshipDTO>>> getAllInternships(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(internshipService.adminGetInternships(pageable)));
    }

    /**
     * Creates a new internship program.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InternshipDTO>> createInternship(@Valid @RequestBody CreateInternshipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Internship program created successfully.", internshipService.createInternship(request)));
    }

    /**
     * Updates an existing internship program.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InternshipDTO>> updateInternship(
            @PathVariable String id,
            @Valid @RequestBody CreateInternshipRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Internship updated successfully.", internshipService.updateInternship(id, request)));
    }

    /**
     * Deletes an internship program.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInternship(@PathVariable String id) {
        internshipService.deleteInternship(id);
        return ResponseEntity.ok(ApiResponse.success("Internship removed successfully.", null));
    }

    /**
     * Retrieves applicant directory with search and status filtering.
     */
    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<Page<InternshipApplicationDTO>>> getApplications(
            @RequestParam(required = false) String internshipId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(internshipService.adminGetApplications(internshipId, status, search, pageable)));
    }

    /**
     * Updates candidate application status.
     */
    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<ApiResponse<InternshipApplicationDTO>> updateApplicationStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Application status updated.", internshipService.adminUpdateApplicationStatus(id, request)));
    }

    /**
     * Schedules candidate interview.
     */
    @PostMapping("/applications/{id}/schedule-interview")
    public ResponseEntity<ApiResponse<InterviewDTO>> scheduleInterview(
            @PathVariable String id,
            @Valid @RequestBody ScheduleInterviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interview scheduled successfully.", internshipService.adminScheduleInterview(id, request)));
    }

    /**
     * Enrolls selected student into active internship cohort.
     */
    @PostMapping("/applications/{id}/enroll")
    public ResponseEntity<ApiResponse<InternshipEnrollmentDTO>> enrollStudent(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Student successfully enrolled in internship cohort.", internshipService.adminEnrollStudent(id)));
    }

    /**
     * Marks student enrollment completed and generates verifiable certificate.
     */
    @PostMapping("/enrollments/{id}/complete")
    public ResponseEntity<ApiResponse<InternshipCertificateDTO>> completeEnrollment(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Internship completed and verified certificate issued successfully!",
                internshipService.adminCompleteEnrollmentAndIssueCertificate(id)
        ));
    }

    /**
     * Returns analytics overview for internships and applications.
     */
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<InternshipAnalyticsDTO>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(internshipService.adminGetAnalytics()));
    }
}

