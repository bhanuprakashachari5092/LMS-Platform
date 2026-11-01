package com.shaivikagroups.lms.tenant;

import com.shaivikagroups.lms.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tenants")
@Tag(name = "Tenants", description = "Multi-Tenant SaaS Management and Resolution APIs")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping("/public/resolve")
    @Operation(summary = "Resolve tenant information by slug or domain for white-label branding")
    public ResponseEntity<ApiResponse<TenantResponse>> resolveTenant(
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String domain) {
        String identifier = (slug != null && !slug.isEmpty()) ? slug : domain;
        TenantEntity entity = tenantService.resolveTenant(identifier);
        return ResponseEntity.ok(ApiResponse.ok(TenantResponse.fromEntity(entity)));
    }

    @GetMapping("/current")
    @Operation(summary = "Get the active tenant for the current request context")
    public ResponseEntity<ApiResponse<TenantResponse>> getCurrentTenant() {
        TenantEntity entity = tenantService.getTenantById(TenantContext.getTenantId());
        return ResponseEntity.ok(ApiResponse.ok(TenantResponse.fromEntity(entity)));
    }

    @PostMapping("/onboard")
    @Operation(summary = "Register and onboard a new organization tenant")
    public ResponseEntity<ApiResponse<TenantResponse>> onboardTenant(@Valid @RequestBody CreateTenantRequest request) {
        TenantEntity created = tenantService.createTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Organization successfully onboarded", TenantResponse.fromEntity(created)));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "List all tenants (Super Admin only)")
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getAllTenants() {
        List<TenantResponse> list = tenantService.getAllTenants().stream()
                .map(TenantResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/{id}/settings")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    @Operation(summary = "Update tenant settings and branding")
    public ResponseEntity<ApiResponse<TenantResponse>> updateTenantSettings(
            @PathVariable String id,
            @Valid @RequestBody UpdateTenantRequest request) {
        TenantEntity updated = tenantService.updateTenant(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Organization settings updated", TenantResponse.fromEntity(updated)));
    }
}

