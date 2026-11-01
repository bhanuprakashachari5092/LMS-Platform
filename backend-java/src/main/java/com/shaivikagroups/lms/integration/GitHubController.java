package com.shaivikagroups.lms.integration;

import com.shaivikagroups.lms.common.ApiResponse;
import com.shaivikagroups.lms.portfolio.PortfolioProjectDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/integrations/github")
@Tag(name = "GitHub Integration", description = "Student GitHub repository import, metrics, and portfolio sync")
public class GitHubController {

    private final GitHubService gitHubService;

    public GitHubController(GitHubService gitHubService) {
        this.gitHubService = gitHubService;
    }

    @GetMapping("/metrics/{username}")
    @Operation(summary = "Fetch student GitHub metrics with scoring, languages, and pinned repos")
    public ResponseEntity<ApiResponse<GitHubMetricsDto>> getMetrics(@PathVariable("username") String username) {
        GitHubMetricsDto metrics = gitHubService.fetchStudentMetrics(username);
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/repos/{username}")
    @Operation(summary = "Fetch student repositories formatted for portfolio project import")
    public ResponseEntity<ApiResponse<List<PortfolioProjectDto>>> getReposForPortfolio(@PathVariable("username") String username) {
        List<PortfolioProjectDto> projects = gitHubService.fetchRepositoriesForPortfolio(username);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }
}

