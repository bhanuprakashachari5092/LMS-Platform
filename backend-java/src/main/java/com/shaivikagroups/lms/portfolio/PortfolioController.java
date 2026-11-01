package com.shaivikagroups.lms.portfolio;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.common.UnauthorizedException;
import com.shaivikagroups.lms.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/portfolio")
@Tag(name = "Student Portfolio", description = "Public portfolio showcase, customizable developer profiles, and GitHub sync")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/public/{handleOrId}")
    @Operation(summary = "Get public student portfolio by custom handle, portfolio ID, or user ID")
    public ResponseEntity<ApiResponse<PortfolioDto>> getPublicPortfolio(@PathVariable("handleOrId") String handleOrId) {
        PortfolioDto portfolio = portfolioService.getPublicPortfolio(handleOrId);
        return ResponseEntity.ok(ApiResponse.success(portfolio));
    }

    @GetMapping({"/my", "/me"})
    @Operation(summary = "Get current authenticated student's portfolio")
    public ResponseEntity<ApiResponse<PortfolioDto>> getMyPortfolio(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "studentId", required = false) String studentId) {
        String userId = principal != null ? principal.getId() : studentId;
        if (userId == null || userId.isBlank()) {
            throw new UnauthorizedException("Authentication required to access student portfolio");
        }
        PortfolioDto portfolio = portfolioService.getMyPortfolio(userId);
        return ResponseEntity.ok(ApiResponse.success(portfolio));
    }

    @RequestMapping(value = {"/my", "/me"}, method = {RequestMethod.PUT, RequestMethod.POST})
    @Operation(summary = "Update current authenticated student's portfolio")
    public ResponseEntity<ApiResponse<PortfolioDto>> updateMyPortfolio(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody PortfolioUpdateRequest request) {
        if (principal == null) {
            throw new UnauthorizedException("Authentication required to update portfolio");
        }
        String userId = principal.getId();
        PortfolioDto portfolio = portfolioService.updateMyPortfolio(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Portfolio updated successfully", portfolio));
    }

    @PostMapping("/my/import-github")
    @Operation(summary = "Import repositories from GitHub to populate portfolio projects")
    public ResponseEntity<ApiResponse<PortfolioDto>> importGithubProjects(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(value = "username", required = false) String queryUsername) {
        if (principal == null) {
            throw new UnauthorizedException("Authentication required to import GitHub repositories");
        }
        String userId = principal.getId();
        String username = queryUsername;
        if ((username == null || username.isBlank()) && body != null) {
            username = body.get("username");
            if (username == null) {
                username = body.get("githubUsername");
            }
        }
        PortfolioDto portfolio = portfolioService.importGithubProjects(userId, username);
        return ResponseEntity.ok(ApiResponse.success("GitHub projects imported successfully", portfolio));
    }
}
