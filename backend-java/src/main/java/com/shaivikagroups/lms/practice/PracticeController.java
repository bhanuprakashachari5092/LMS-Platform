package com.shaivikagroups.lms.practice;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.common.UnauthorizedException;
import com.shaivikagroups.lms.practice.dto.*;
import com.shaivikagroups.lms.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/practice")
public class PracticeController {

    private final PracticeService practiceService;
    private final LanguageRegistry languageRegistry;

    public PracticeController(PracticeService practiceService, LanguageRegistry languageRegistry) {
        this.practiceService = practiceService;
        this.languageRegistry = languageRegistry;
    }

    /**
     * Lists active supported programming languages and starter codes.
     */
    @GetMapping("/languages")
    public ResponseEntity<ApiResponse<List<LanguageConfigDTO>>> getSupportedLanguages() {
        return ResponseEntity.ok(ApiResponse.success(languageRegistry.getAllLanguages()));
    }

    /**
     * Lists published practice problems with pagination.
     */
    @GetMapping("/problems")
    public ResponseEntity<ApiResponse<Page<PracticeProblemSummaryDTO>>> getProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(practiceService.getProblems(pageable)));
    }

    /**
     * Retrieves problem details, templates, and sample test cases.
     * Hidden test cases are never returned to students.
     */
    @GetMapping("/problems/{idOrSlug}")
    public ResponseEntity<ApiResponse<PracticeProblemDetailDTO>> getProblemDetail(
            @PathVariable String idOrSlug,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("LECTURER"));
        return ResponseEntity.ok(ApiResponse.success(practiceService.getProblemDetail(idOrSlug, isAdmin)));
    }

    /**
     * Executes student code against custom stdin or sample test cases.
     */
    @PostMapping("/run")
    public ResponseEntity<ApiResponse<RunCodeResponse>> runCode(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RunCodeRequest request) {
        String userId = principal != null ? principal.getId() : "anonymous_guest";
        return ResponseEntity.ok(ApiResponse.success("Code executed", practiceService.runCode(request, userId)));
    }

    /**
     * Evaluates student code against all sample and hidden test cases.
     * Strict evaluation; hidden test inputs/outputs are not leaked.
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitCode(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SubmitCodeRequest request) {
        if (principal == null) {
            throw new UnauthorizedException("You must be logged in to submit code for grading.");
        }
        SubmissionResponse response = practiceService.submitCode(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Code submitted for evaluation", response));
    }

    /**
     * Retrieves specific submission result by ID.
     */
    @GetMapping("/submissions/{id}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmissionById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Authentication required");
        }
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("LECTURER"));
        return ResponseEntity.ok(ApiResponse.success(practiceService.getSubmissionById(id, principal.getId(), isAdmin)));
    }

    /**
     * Lists submissions by the authenticated user.
     */
    @GetMapping("/my-submissions")
    public ResponseEntity<ApiResponse<Page<SubmissionResponse>>> getMySubmissions(
            @RequestParam(required = false) String problemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Authentication required");
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(practiceService.getMySubmissions(problemId, principal.getId(), pageable)));
    }

    /**
     * Retrieves saved draft code for a problem.
     */
    @GetMapping("/drafts/{problemId}")
    public ResponseEntity<ApiResponse<PracticeDraftDTO>> getDraft(
            @PathVariable String problemId,
            @RequestParam(required = false) String language,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return practiceService.getDraft(problemId, language, principal.getId())
                .map(d -> ResponseEntity.ok(ApiResponse.success(d)))
                .orElse(ResponseEntity.ok(ApiResponse.success("No draft found", null)));
    }

    /**
     * Autosaves draft code for a problem.
     */
    @PutMapping("/drafts/{problemId}")
    public ResponseEntity<ApiResponse<PracticeDraftDTO>> saveDraft(
            @PathVariable String problemId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SaveDraftRequest request) {
        if (principal == null) {
            throw new UnauthorizedException("Authentication required");
        }
        PracticeDraftDTO draft = practiceService.saveDraft(problemId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Draft saved successfully", draft));
    }

    // --- Admin Problem Management ---

    @PostMapping("/admin/problems")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PracticeProblemDetailDTO>> createProblem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProblemRequest request) {
        String authorId = principal != null ? principal.getId() : null;
        PracticeProblemDetailDTO response = practiceService.createProblem(request, authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Problem created successfully", response));
    }

    @PutMapping("/admin/problems/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PracticeProblemDetailDTO>> updateProblem(
            @PathVariable String id,
            @Valid @RequestBody CreateProblemRequest request) {
        PracticeProblemDetailDTO response = practiceService.updateProblem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Problem updated successfully", response));
    }

    @DeleteMapping("/admin/problems/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(@PathVariable String id) {
        practiceService.deleteProblem(id);
        return ResponseEntity.ok(ApiResponse.success("Problem deleted successfully"));
    }
}
