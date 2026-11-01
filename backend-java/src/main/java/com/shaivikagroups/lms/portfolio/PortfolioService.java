package com.shaivikagroups.lms.portfolio;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.certificate.CertificateEntity;
import com.shaivikagroups.lms.certificate.CertificateRepository;
import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.integration.GitHubService;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.UserEntity;
import com.shaivikagroups.lms.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class PortfolioService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioService.class);

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final CertificateRepository certificateRepository;
    private final GitHubService gitHubService;
    private final ObjectMapper objectMapper;

    public PortfolioService(PortfolioRepository portfolioRepository,
                            UserRepository userRepository,
                            CertificateRepository certificateRepository,
                            GitHubService gitHubService) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.certificateRepository = certificateRepository;
        this.gitHubService = gitHubService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Get a public student portfolio by custom handle, portfolio ID, or user ID
     */
    @Transactional(readOnly = true)
    public PortfolioDto getPublicPortfolio(String handleOrId) {
        String cleanHandle = handleOrId != null ? handleOrId.trim() : "";
        if (cleanHandle.isBlank()) {
            throw new ResourceNotFoundException("Portfolio not found");
        }

        // 1. Try find by custom handle
        Optional<PortfolioEntity> entityOpt = portfolioRepository.findByCustomHandle(cleanHandle);

        // 2. Try find by portfolio ID
        if (entityOpt.isEmpty()) {
            entityOpt = portfolioRepository.findById(cleanHandle);
        }

        // 3. Try find by user ID
        if (entityOpt.isEmpty()) {
            Optional<UserEntity> userOpt = userRepository.findById(cleanHandle);
            if (userOpt.isPresent()) {
                UserEntity u = userOpt.get();
                entityOpt = portfolioRepository.findByTenantIdAndUserId(u.getTenantId(), u.getId());
                if (entityOpt.isEmpty()) {
                    // Return a default populated view for this user
                    return buildDefaultPortfolioDto(u);
                }
            }
        }

        PortfolioEntity entity = entityOpt.orElseThrow(() -> new ResourceNotFoundException("Portfolio not found for '" + cleanHandle + "'"));

        if (!entity.isPublic()) {
            throw new ResourceNotFoundException("Portfolio is private or unpublished");
        }

        UserEntity user = userRepository.findById(entity.getUserId()).orElse(null);
        return mapToDto(entity, user);
    }

    /**
     * Get current authenticated student's portfolio (creates draft if none exists)
     */
    @Transactional
    public PortfolioDto getMyPortfolio(String userId) {
        String tenantId = TenantContext.getTenantId();
        UserEntity user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PortfolioEntity entity = portfolioRepository.findByTenantIdAndUserId(tenantId, userId)
                .orElseGet(() -> createInitialPortfolio(tenantId, user));

        return mapToDto(entity, user);
    }

    /**
     * Update current student's portfolio
     */
    @Transactional
    public PortfolioDto updateMyPortfolio(String userId, PortfolioUpdateRequest request) {
        String tenantId = TenantContext.getTenantId();
        UserEntity user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PortfolioEntity entity = portfolioRepository.findByTenantIdAndUserId(tenantId, userId)
                .orElseGet(() -> createInitialPortfolio(tenantId, user));

        // 1. Handle custom handle uniqueness check
        if (request.getCustomHandle() != null && !request.getCustomHandle().isBlank()) {
            String newHandle = request.getCustomHandle().trim().toLowerCase();
            if (!newHandle.matches("^[a-zA-Z0-9_-]{3,30}$")) {
                throw new BadRequestException("Custom handle must be 3-30 characters (letters, numbers, hyphens, underscores)");
            }
            if (!newHandle.equalsIgnoreCase(entity.getCustomHandle())) {
                if (portfolioRepository.existsByCustomHandle(newHandle)) {
                    throw new BadRequestException("Handle @" + newHandle + " is already taken by another user");
                }
                entity.setCustomHandle(newHandle);
            }
        }

        if (request.getHeadline() != null) entity.setHeadline(request.getHeadline());
        if (request.getBio() != null) entity.setBio(request.getBio());
        if (request.getResumeUrl() != null) entity.setResumeUrl(request.getResumeUrl());
        if (request.getAccentColor() != null) entity.setAccentColor(request.getAccentColor());
        if (request.getTemplate() != null) entity.setTemplate(request.getTemplate());
        if (request.getIsPublic() != null) entity.setPublic(request.getIsPublic());

        try {
            if (request.getSkills() != null) {
                entity.setSkillsPayload(objectMapper.writeValueAsString(request.getSkills()));
            }
            if (request.getProjects() != null) {
                entity.setProjectsPayload(objectMapper.writeValueAsString(request.getProjects()));
            }
            if (request.getSocialLinks() != null) {
                entity.setSocialLinksPayload(objectMapper.writeValueAsString(request.getSocialLinks()));
            }
        } catch (Exception e) {
            log.error("Failed to serialize portfolio JSON payload: {}", e.getMessage());
            throw new BadRequestException("Invalid portfolio payload structure");
        }

        // If user changed full name
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
            userRepository.save(user);
        }

        entity.setUpdatedAt(Instant.now());
        PortfolioEntity saved = portfolioRepository.save(entity);

        return mapToDto(saved, user);
    }

    /**
     * Import GitHub repositories directly into student's portfolio projects
     */
    @Transactional
    public PortfolioDto importGithubProjects(String userId, String rawGithubUsername) {
        String tenantId = TenantContext.getTenantId();
        UserEntity user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PortfolioEntity entity = portfolioRepository.findByTenantIdAndUserId(tenantId, userId)
                .orElseGet(() -> createInitialPortfolio(tenantId, user));

        String username = rawGithubUsername != null ? rawGithubUsername.trim() : "";
        if (username.isBlank() && user.getGithubUsername() != null) {
            username = user.getGithubUsername();
        }
        if (username.isBlank()) {
            throw new BadRequestException("GitHub username is required for import");
        }

        List<PortfolioProjectDto> importedProjects = gitHubService.fetchRepositoriesForPortfolio(username);

        // Merge with existing projects
        List<PortfolioProjectDto> currentProjects = deserializeProjects(entity.getProjectsPayload());
        Set<String> existingTitles = new HashSet<>();
        for (PortfolioProjectDto p : currentProjects) {
            existingTitles.add(p.getTitle().toLowerCase());
        }

        for (PortfolioProjectDto imported : importedProjects) {
            if (!existingTitles.contains(imported.getTitle().toLowerCase())) {
                currentProjects.add(imported);
            }
        }

        try {
            entity.setProjectsPayload(objectMapper.writeValueAsString(currentProjects));
        } catch (Exception e) {
            log.error("Error saving imported projects: {}", e.getMessage());
        }

        // Update user's GitHub username if not set
        user.setGithubUsername(username);
        user.setGithubUrl("https://github.com/" + username);
        userRepository.save(user);

        entity.setUpdatedAt(Instant.now());
        PortfolioEntity saved = portfolioRepository.save(entity);

        return mapToDto(saved, user);
    }

    private PortfolioEntity createInitialPortfolio(String tenantId, UserEntity user) {
        PortfolioEntity entity = new PortfolioEntity();
        entity.setId(UUID.randomUUID().toString());
        entity.setTenantId(tenantId);
        entity.setUserId(user.getId());

        String defaultHandle = user.getFullName().toLowerCase().replaceAll("[^a-z0-9]", "");
        if (defaultHandle.length() < 3) defaultHandle = "dev" + user.getId().substring(0, 4);
        if (portfolioRepository.existsByCustomHandle(defaultHandle)) {
            defaultHandle += "-" + UUID.randomUUID().toString().substring(0, 4);
        }
        entity.setCustomHandle(defaultHandle);
        entity.setHeadline("Passionate Cloud & Full-Stack Developer");
        entity.setBio(user.getBio() != null ? user.getBio() : "Engineering high-performance web systems and automated cloud pipelines.");
        entity.setAccentColor("#4f46e5");
        entity.setTemplate("modern_tech");
        entity.setPublic(true);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        try {
            entity.setSkillsPayload(objectMapper.writeValueAsString(List.of("Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker", "Linux")));
            entity.setProjectsPayload(objectMapper.writeValueAsString(List.of(
                    new PortfolioProjectDto("p1", "LMS SaaS Platform", "Modern cloud LMS with AI Mentor, real-time analytics, and tamper-resistant certificates.", List.of("Java", "Spring Boot", "React", "PostgreSQL"), "https://github.com", "", true),
                    new PortfolioProjectDto("p2", "System Diagnostics Sandbox", "Interactive terminal laboratory environment for Linux syscall verification.", List.of("Linux", "Shell", "Security"), "https://github.com", "", false)
            )));
            Map<String, String> links = new HashMap<>();
            if (user.getGithubUrl() != null) links.put("github", user.getGithubUrl());
            entity.setSocialLinksPayload(objectMapper.writeValueAsString(links));
        } catch (Exception e) {
            entity.setSkillsPayload("[]");
            entity.setProjectsPayload("[]");
            entity.setSocialLinksPayload("{}");
        }

        return portfolioRepository.save(entity);
    }

    private PortfolioDto mapToDto(PortfolioEntity entity, UserEntity user) {
        PortfolioDto dto = new PortfolioDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setCustomHandle(entity.getCustomHandle());
        dto.setHeadline(entity.getHeadline());
        dto.setBio(entity.getBio());
        dto.setResumeUrl(entity.getResumeUrl());
        dto.setAccentColor(entity.getAccentColor());
        dto.setTemplate(entity.getTemplate());
        dto.setPublic(entity.isPublic());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (user != null) {
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setAvatarUrl(user.getAvatarUrl());
            dto.setGithubUrl(user.getGithubUrl());
            dto.setXp(user.getXpPoints());

            // Count verified certificates
            List<CertificateEntity> certs = certificateRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(entity.getTenantId(), user.getId());
            dto.setCertificatesCount(certs != null ? certs.size() : 0);
        } else {
            dto.setFullName("Student Developer");
        }

        dto.setSkills(deserializeSkills(entity.getSkillsPayload()));
        dto.setProjects(deserializeProjects(entity.getProjectsPayload()));
        dto.setSocialLinks(deserializeSocialLinks(entity.getSocialLinksPayload()));

        return dto;
    }

    private PortfolioDto buildDefaultPortfolioDto(UserEntity user) {
        PortfolioDto dto = new PortfolioDto();
        dto.setId("default_" + user.getId());
        dto.setUserId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setGithubUrl(user.getGithubUrl());
        dto.setHeadline("Passionate Cloud & Full-Stack Developer");
        dto.setBio(user.getBio() != null ? user.getBio() : "Engineering resilient software and continuous integration architectures.");
        dto.setCustomHandle(user.getFullName().toLowerCase().replaceAll("[^a-z0-9]", ""));
        dto.setAccentColor("#4f46e5");
        dto.setTemplate("modern_tech");
        dto.setPublic(true);
        dto.setXp(user.getXpPoints());
        dto.setCertificatesCount(0);
        dto.setSkills(List.of("Java", "TypeScript", "React", "Docker"));
        dto.setProjects(List.of());
        dto.setSocialLinks(Map.of());
        dto.setCreatedAt(Instant.now());
        dto.setUpdatedAt(Instant.now());
        return dto;
    }

    private List<String> deserializeSkills(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<PortfolioProjectDto> deserializeProjects(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private Map<String, String> deserializeSocialLinks(String json) {
        if (json == null || json.isBlank()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
