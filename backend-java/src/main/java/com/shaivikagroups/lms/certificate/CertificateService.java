package com.shaivikagroups.lms.certificate;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.course.CourseEntity;
import com.shaivikagroups.lms.course.CourseRepository;
import com.shaivikagroups.lms.enrollment.EnrollmentEntity;
import com.shaivikagroups.lms.enrollment.EnrollmentRepository;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.UserEntity;
import com.shaivikagroups.lms.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CertificateService(
            CertificateRepository certificateRepository,
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            UserRepository userRepository) {
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> generateCertificate(String currentUserId, CertificateRequest request) {
        String tenantId = TenantContext.getTenantId();
        String targetUserId = (request.getStudentId() != null && !request.getStudentId().isBlank())
                ? request.getStudentId()
                : currentUserId;

        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", request.getCourseId()));

        UserEntity user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        // Check enrollment
        EnrollmentEntity enrollment = enrollmentRepository
                .findByTenantIdAndUserIdAndCourseId(tenantId, targetUserId, request.getCourseId())
                .orElseThrow(() -> new BadRequestException("Student is not enrolled in this course."));

        // Check if certificate already exists and forceRegenerate is false
        Optional<CertificateEntity> existingOpt = certificateRepository
                .findByTenantIdAndUserIdAndCourseId(tenantId, targetUserId, request.getCourseId());

        if (existingOpt.isPresent() && !request.isForceRegenerate()) {
            CertificateEntity existing = existingOpt.get();
            CertificateResponse resp = mapToResponse(existing);
            CertificateJobResponse job = new CertificateJobResponse(
                    "job_" + existing.getId(), "completed", existing.getCertificateNumber(), existing.getPdfUrl());
            Map<String, Object> result = new HashMap<>();
            result.put("certificate", resp);
            result.put("job", job);
            return result;
        }

        // Generate unique certificate number: KQ-<SHORT_SLUG>-<YEAR>-<RANDOM>
        String slugSnippet = course.getSlug() != null
                ? course.getSlug().replace("-", "").toUpperCase()
                : "GEN";
        if (slugSnippet.length() > 6) {
            slugSnippet = slugSnippet.substring(0, 6);
        }
        int randomSuffix = ThreadLocalRandom.current().nextInt(100000, 999999);
        int currentYear = LocalDate.now().getYear();
        String certNumber = String.format("KQ-%s-%d-%d", slugSnippet, currentYear, randomSuffix);

        // Verification hash & QR payload
        String rawData = targetUserId + ":" + course.getId() + ":" + certNumber + ":" + LocalDate.now();
        String verificationHash = hashSha256(rawData);
        String qrPayload = "https://shaivika-lms.vercel.app/verify-certificate?id=" + certNumber;
        String pdfUrl = "/api/v1/certificates/download/" + certNumber;

        CertificateEntity cert = existingOpt.orElseGet(CertificateEntity::new);
        if (cert.getId() == null) {
            cert.setId("cert_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        }
        cert.setCertificateNumber(certNumber);
        cert.setTenantId(tenantId);
        cert.setUserId(targetUserId);
        cert.setCourseId(course.getId());
        cert.setStudentName(request.getStudentName() != null && !request.getStudentName().isBlank()
                ? request.getStudentName()
                : user.getFullName());
        cert.setCourseTitle(course.getTitle());
        cert.setIssueDate(LocalDate.now());
        cert.setPdfUrl(pdfUrl);
        cert.setQrPayload(qrPayload);
        cert.setVerificationHash(verificationHash);
        cert.setStatus(CertificateStatus.VALID);

        CertificateEntity saved = certificateRepository.save(cert);
        CertificateResponse resp = mapToResponse(saved);
        CertificateJobResponse job = new CertificateJobResponse(
                "job_" + saved.getId(), "completed", saved.getCertificateNumber(), saved.getPdfUrl());

        Map<String, Object> result = new HashMap<>();
        result.put("certificate", resp);
        result.put("job", job);
        return result;
    }

    @Transactional(readOnly = true)
    public CertificateVerificationResponse verifyCertificate(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            CertificateVerificationResponse resp = new CertificateVerificationResponse();
            resp.setAuthentic(false);
            return resp;
        }

        Optional<CertificateEntity> certOpt = certificateRepository.findByCertificateNumber(identifier);
        if (certOpt.isEmpty()) {
            certOpt = certificateRepository.findById(identifier);
        }

        if (certOpt.isEmpty()) {
            CertificateVerificationResponse resp = new CertificateVerificationResponse();
            resp.setAuthentic(false);
            return resp;
        }

        CertificateEntity cert = certOpt.get();
        CertificateVerificationResponse resp = new CertificateVerificationResponse();
        resp.setAuthentic(cert.getStatus() == CertificateStatus.VALID);
        resp.setCertificateId(cert.getId());
        resp.setVerificationId(cert.getCertificateNumber());
        resp.setStudentName(cert.getStudentName());
        resp.setCourseTitle(cert.getCourseTitle());
        resp.setCourseName(cert.getCourseTitle());
        resp.setIssueDate(cert.getIssueDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
        resp.setCompletionDate(cert.getIssueDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
        resp.setStatus(cert.getStatus().name());
        resp.setPdfUrl(cert.getPdfUrl());

        userRepository.findById(cert.getUserId()).ifPresent(u -> resp.setStudentEmail(u.getEmail()));
        return resp;
    }

    @Transactional(readOnly = true)
    public CertificateJobResponse getJobStatus(String jobId) {
        String cleanId = jobId.startsWith("job_") ? jobId.substring(4) : jobId;
        Optional<CertificateEntity> certOpt = certificateRepository.findById(cleanId);
        if (certOpt.isPresent()) {
            CertificateEntity cert = certOpt.get();
            return new CertificateJobResponse(jobId, "completed", cert.getCertificateNumber(), cert.getPdfUrl());
        }
        return new CertificateJobResponse(jobId, "queued", null, null);
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getMyCertificates(String userId) {
        String tenantId = TenantContext.getTenantId();
        return certificateRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificateById(String id) {
        CertificateEntity cert = certificateRepository.findById(id)
                .or(() -> certificateRepository.findByCertificateNumber(id))
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + id));
        return mapToResponse(cert);
    }

    private CertificateResponse mapToResponse(CertificateEntity entity) {
        CertificateResponse resp = new CertificateResponse();
        resp.setId(entity.getId());
        resp.setCertificateNumber(entity.getCertificateNumber());
        resp.setTenantId(entity.getTenantId());
        resp.setUserId(entity.getUserId());
        resp.setCourseId(entity.getCourseId());
        resp.setStudentName(entity.getStudentName());
        resp.setCourseTitle(entity.getCourseTitle());
        resp.setIssueDate(entity.getIssueDate());
        resp.setPdfUrl(entity.getPdfUrl());
        resp.setQrPayload(entity.getQrPayload());
        resp.setVerificationHash(entity.getVerificationHash());
        resp.setStatus(entity.getStatus().name());
        resp.setCreatedAt(entity.getCreatedAt());
        return resp;
    }

    private String hashSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString();
        }
    }
}
