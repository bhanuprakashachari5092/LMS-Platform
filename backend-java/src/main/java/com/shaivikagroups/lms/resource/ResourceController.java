package com.shaivikagroups.lms.resource;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Lesson Resources", description = "Lesson study materials and resource links")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/lessons/{lessonId}/resources")
    @Operation(summary = "Get list of resources for a lesson")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getResources(@PathVariable String lessonId) {
        List<ResourceResponse> resources = resourceService.getResourcesByLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.success("Resources retrieved", resources));
    }

    @PostMapping("/lessons/{lessonId}/resources")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Add a study resource/attachment to a lesson")
    public ResponseEntity<ApiResponse<ResourceResponse>> addResource(
            @PathVariable String lessonId,
            @Valid @RequestBody ResourceRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ResourceResponse resource = resourceService.addResource(lessonId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource added successfully", resource));
    }

    @DeleteMapping("/resources/{resourceId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'LECTURER')")
    @Operation(summary = "Delete a lesson resource")
    public ResponseEntity<ApiResponse<Void>> deleteResource(
            @PathVariable String resourceId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        resourceService.deleteResource(resourceId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully"));
    }
}

