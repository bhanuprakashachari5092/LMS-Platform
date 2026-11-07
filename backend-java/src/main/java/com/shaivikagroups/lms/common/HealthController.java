package com.shaivikagroups.lms.common;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health check & baseline probe endpoints for Render, Vercel, and load balancers.
 */
@RestController
@Tag(name = "Health & System Diagnostics", description = "Endpoints for platform health probes and diagnostics")
public class HealthController {

    @GetMapping("/")
    @Operation(summary = "Root Connection Endpoint")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("service", "KaizenQ LMS Java Backend");
        response.put("status", "running");
        response.put("framework", "Spring Boot 3.3.4 (Java 17 LTS)");
        response.put("database", "PostgreSQL");
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping({"/health", "/api/v1/health"})
    @Operation(summary = "Platform Health Check Endpoint")
    public ResponseEntity<Map<String, Object>> health() {
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "healthy");
        response.put("uptime", uptimeSeconds);
        response.put("timestamp", Instant.now().toString());
        response.put("version", "2.0.0");
        return ResponseEntity.ok(response);
    }
}

