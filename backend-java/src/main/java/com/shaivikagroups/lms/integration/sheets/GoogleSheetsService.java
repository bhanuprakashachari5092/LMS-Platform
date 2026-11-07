package com.shaivikagroups.lms.integration.sheets;

import com.shaivikagroups.lms.internship.InternshipApplicationEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleSheetsService {

    private static final Logger log = LoggerFactory.getLogger(GoogleSheetsService.class);

    private final RestTemplate restTemplate;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${app.sheets.apps-script-url:https://script.google.com/macros/s/AKfycbwG4HnE51tX3wDqLw6b6w9jR2L5vU/exec}")
    private String appsScriptUrl;

    @Value("${app.sheets.spreadsheet-id:1og9L7aU0R4_30uavzj17PZGAlGFt70VxVEwJ1WKKy_w}")
    private String spreadsheetId;

    @Value("${app.sheets.sheet-name:Applications}")
    private String sheetName;

    public GoogleSheetsService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Synchronizes candidate application with the configured Google Sheet
     * using the Google Apps Script Web App webhook.
     * Fails gracefully without breaking the primary database transaction.
     */
    public void syncApplication(InternshipApplicationEntity app, String internshipTitle) {
        if ("test".equalsIgnoreCase(activeProfile) || appsScriptUrl == null || appsScriptUrl.isBlank() || appsScriptUrl.contains("YOUR_SCRIPT_ID")) {
            log.info("[GOOGLE SHEETS MOCK] Recorded application {} ({}) for '{}'",
                    app.getReferenceNumber(), app.getFullName(), internshipTitle);
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("action", "appendApplication");
            payload.put("spreadsheetId", spreadsheetId);
            payload.put("sheetName", sheetName);

            Map<String, Object> rowData = new HashMap<>();
            rowData.put("applicationId", app.getId());
            rowData.put("referenceNumber", app.getReferenceNumber());
            rowData.put("applicantName", app.getFullName());
            rowData.put("email", app.getEmail());
            rowData.put("phone", app.getPhone());
            rowData.put("college", app.getCollege());
            rowData.put("degree", app.getDegree());
            rowData.put("branch", app.getBranch());
            rowData.put("graduationYear", app.getGraduationYear());
            rowData.put("skills", app.getSkills());
            rowData.put("roleTitle", internshipTitle);
            rowData.put("resumeUrl", app.getResumeUrl());
            rowData.put("githubUrl", app.getGithubUrl());
            rowData.put("linkedinUrl", app.getLinkedinUrl());
            rowData.put("status", app.getStatus());
            rowData.put("appliedAt", app.getAppliedAt() != null ? app.getAppliedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) : "");

            payload.put("data", rowData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            restTemplate.postForObject(appsScriptUrl, request, String.class);
            log.info("[GOOGLE SHEETS SUCCESS] Successfully appended application {} to Google Sheet", app.getReferenceNumber());
        } catch (Exception e) {
            log.warn("[GOOGLE SHEETS WARN] Failed to sync application {} with Google Sheets: {}",
                    app.getReferenceNumber(), e.getMessage());
        }
    }
}
