package com.shaivikagroups.lms.internship;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.common.UnauthorizedException;
import com.shaivikagroups.lms.internship.dto.*;
import com.shaivikagroups.lms.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/internships", "/api/v1/careers"})
public class InternshipPublicController {

    private final InternshipService internshipService;

    public InternshipPublicController(InternshipService internshipService) {
        this.internshipService = internshipService;
    }

    /**
     * Lists published openings with filtering and pagination.
     */
    @GetMapping({"", "/openings"})
    public ResponseEntity<ApiResponse<Page<InternshipDTO>>> getOpenInternships(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String internshipType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        String finalType = type != null ? type : internshipType;
        Page<InternshipDTO> results = internshipService.getOpenInternships(domain, department, employmentType, finalType, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * Retrieves detailed curriculum, tasks, and prerequisites for an opening.
     */
    @GetMapping({"/{slugOrId}", "/openings/{slugOrId}"})
    public ResponseEntity<ApiResponse<InternshipDetailDTO>> getInternshipDetail(@PathVariable String slugOrId) {
        return ResponseEntity.ok(ApiResponse.success(internshipService.getInternshipDetail(slugOrId)));
    }

    /**
     * Submits an application for an internship/career opening.
     * Prevents duplicate applications for the same candidate and role.
     */
    @PostMapping({"/apply", "/applications"})
    public ResponseEntity<ApiResponse<InternshipApplicationDTO>> submitApplication(
            @Valid @RequestBody SubmitApplicationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        InternshipApplicationDTO result = internshipService.submitApplication(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Your application has been successfully submitted! Reference Number: " + result.referenceNumber(), result));
    }

    /**
     * Withdraw an application by candidate.
     */
    @PostMapping("/applications/{applicationId}/withdraw")
    public ResponseEntity<ApiResponse<InternshipApplicationDTO>> withdrawApplication(
            @PathVariable String applicationId,
            @RequestBody(required = false) WithdrawApplicationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("You must be logged in to withdraw an application.");
        }
        InternshipApplicationDTO result = internshipService.withdrawApplication(applicationId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Your application has been withdrawn.", result));
    }

    /**
     * Returns student's submitted applications and interview details.
     */
    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<List<InternshipApplicationDTO>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("You must be logged in to track applications.");
        }
        return ResponseEntity.ok(ApiResponse.success(internshipService.getMyApplications(currentUser)));
    }

    /**
     * Returns student's active internship enrollments and weekly deliverables.
     */
    @GetMapping("/my-enrollments")
    public ResponseEntity<ApiResponse<List<InternshipEnrollmentDTO>>> getMyEnrollments(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("You must be logged in to access internship learning.");
        }
        return ResponseEntity.ok(ApiResponse.success(internshipService.getMyEnrollments(currentUser)));
    }

    /**
     * Submits a weekly project deliverable.
     */
    @PostMapping("/tasks/{taskId}/submit")
    public ResponseEntity<ApiResponse<InternshipEnrollmentDTO.EnrollmentTaskSubmissionDTO>> submitTask(
            @PathVariable String taskId,
            @Valid @RequestBody SubmitTaskRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("You must be logged in to submit assignments.");
        }
        return ResponseEntity.ok(ApiResponse.success(
                "Task submission received successfully!",
                internshipService.submitTaskDeliverable(taskId, request, currentUser)
        ));
    }

    /**
     * Returns student's issued internship completion certificates.
     */
    @GetMapping("/my-certificates")
    public ResponseEntity<ApiResponse<List<InternshipCertificateDTO>>> getMyCertificates(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("You must be logged in to access certificates.");
        }
        return ResponseEntity.ok(ApiResponse.success(internshipService.getMyCertificates(currentUser)));
    }

    /**
     * Public verification endpoint for an internship credential.
     */
    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<ApiResponse<InternshipCertificateDTO>> verifyCertificate(
            @PathVariable String certificateNumber) {
        return ResponseEntity.ok(ApiResponse.success(internshipService.verifyCertificate(certificateNumber)));
    }
}
