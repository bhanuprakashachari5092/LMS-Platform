package com.shaivikagroups.lms.certificate;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateCertificate(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CertificateRequest request) {
        Map<String, Object> result = certificateService.generateCertificate(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Certificate generated successfully", result));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<CertificateJobResponse>> getJobStatus(@PathVariable String jobId) {
        return ResponseEntity.ok(ApiResponse.success(certificateService.getJobStatus(jobId)));
    }

    @GetMapping("/verify/{identifier}")
    public ResponseEntity<ApiResponse<CertificateVerificationResponse>> verifyCertificate(@PathVariable String identifier) {
        return ResponseEntity.ok(ApiResponse.success(certificateService.verifyCertificate(identifier)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getMyCertificates(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(certificateService.getMyCertificates(principal.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificateById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(certificateService.getCertificateById(id)));
    }
}

