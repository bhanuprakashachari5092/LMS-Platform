package com.shaivikagroups.lms.practice;

import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ForbiddenException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.practice.dto.*;
import com.shaivikagroups.lms.tenant.TenantContext;
import com.shaivikagroups.lms.user.UserEntity;
import com.shaivikagroups.lms.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PracticeService {

    private static final Logger log = LoggerFactory.getLogger(PracticeService.class);

    private final PracticeProblemRepository problemRepository;
    private final PracticeProblemTemplateRepository templateRepository;
    private final PracticeTestCaseRepository testCaseRepository;
    private final PracticeSubmissionRepository submissionRepository;
    private final PracticeSubmissionResultRepository submissionResultRepository;
    private final PracticeDraftRepository draftRepository;
    private final CodeExecutionService codeExecutionService;
    private final LanguageRegistry languageRegistry;
    private final UserRepository userRepository;

    public PracticeService(
            PracticeProblemRepository problemRepository,
            PracticeProblemTemplateRepository templateRepository,
            PracticeTestCaseRepository testCaseRepository,
            PracticeSubmissionRepository submissionRepository,
            PracticeSubmissionResultRepository submissionResultRepository,
            PracticeDraftRepository draftRepository,
            CodeExecutionService codeExecutionService,
            LanguageRegistry languageRegistry,
            UserRepository userRepository) {
        this.problemRepository = problemRepository;
        this.templateRepository = templateRepository;
        this.testCaseRepository = testCaseRepository;
        this.submissionRepository = submissionRepository;
        this.submissionResultRepository = submissionResultRepository;
        this.draftRepository = draftRepository;
        this.codeExecutionService = codeExecutionService;
        this.languageRegistry = languageRegistry;
        this.userRepository = userRepository;
    }

    /**
     * Lists published practice problems for the current tenant.
     */
    @Transactional(readOnly = true)
    public Page<PracticeProblemSummaryDTO> getProblems(Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return problemRepository.findByTenantIdAndIsPublishedTrue(tenantId, pageable)
                .map(this::toSummaryDTO);
    }

    /**
     * Retrieves detailed problem description and templates.
     * Hidden test cases are strictly filtered out for student calls.
     */
    @Transactional(readOnly = true)
    public PracticeProblemDetailDTO getProblemDetail(String idOrSlug, boolean isAdmin) {
        PracticeProblemEntity entity = findProblemByIdOrSlug(idOrSlug);
        PracticeProblemDetailDTO dto = new PracticeProblemDetailDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setSlug(entity.getSlug());
        dto.setDescription(entity.getDescription());
        dto.setDifficulty(entity.getDifficulty());
        dto.setCategory(entity.getCategory());
        dto.setTopicTags(entity.getTopicTags());
        dto.setConstraints(entity.getConstraints());
        dto.setHints(entity.getHints());
        dto.setTimeLimitMs(entity.getTimeLimitMs());
        dto.setMemoryLimitKb(entity.getMemoryLimitKb());
        dto.setPublished(entity.isPublished());
        dto.setCreatedAt(entity.getCreatedAt());

        // Load templates
        List<PracticeProblemTemplateEntity> templates = templateRepository.findByProblemId(entity.getId());
        Map<String, String> templateMap = new HashMap<>();
        for (PracticeProblemTemplateEntity t : templates) {
            templateMap.put(t.getLanguage().toLowerCase(), t.getStarterCode());
        }
        // Fill defaults if language missing
        for (LanguageConfigDTO lang : languageRegistry.getAllLanguages()) {
            templateMap.putIfAbsent(lang.getId(), lang.getStarterCode());
        }
        dto.setTemplates(templateMap);

        // Load test cases
        List<PracticeTestCaseEntity> allCases = testCaseRepository.findByProblemIdOrderByDisplayOrderAsc(entity.getId());
        List<PracticeTestCaseDTO> sampleCases = new ArrayList<>();
        int hiddenCount = 0;

        for (PracticeTestCaseEntity tc : allCases) {
            if (tc.isHidden()) {
                hiddenCount++;
                if (isAdmin) {
                    sampleCases.add(toTestCaseDTO(tc, false));
                }
            } else {
                sampleCases.add(toTestCaseDTO(tc, false));
            }
        }

        dto.setSampleTestCases(sampleCases);
        dto.setHiddenTestCaseCount(hiddenCount);

        return dto;
    }

    /**
     * Executes user code against custom input or first sample test case.
     */
    public RunCodeResponse runCode(RunCodeRequest request, String userId) {
        PracticeProblemEntity problem = findProblemByIdOrSlug(request.getProblemId());

        if (!languageRegistry.isSupported(request.getLanguage())) {
            throw new BadRequestException("Unsupported programming language: " + request.getLanguage());
        }

        String input = request.getCustomInput();
        PracticeTestCaseEntity matchedTestCase = null;

        List<PracticeTestCaseEntity> sampleCases = testCaseRepository.findByProblemIdAndIsHiddenFalseOrderByDisplayOrderAsc(problem.getId());
        if (input == null || input.trim().isEmpty()) {
            if (!sampleCases.isEmpty()) {
                matchedTestCase = sampleCases.get(0);
                input = matchedTestCase.getInputData();
            } else {
                input = "";
            }
        } else {
            // Check if matches one of the sample test cases
            for (PracticeTestCaseEntity tc : sampleCases) {
                if (tc.getInputData() != null && tc.getInputData().trim().equals(input.trim())) {
                    matchedTestCase = tc;
                    break;
                }
            }
        }

        CodeExecutionResult execResult = codeExecutionService.execute(
                request.getLanguage(),
                request.getCode(),
                input,
                problem.getTimeLimitMs(),
                problem.getMemoryLimitKb()
        );

        RunCodeResponse response = new RunCodeResponse();
        response.setStdout(execResult.getStdout());
        response.setStderr(execResult.getStderr());
        response.setCompileOutput(execResult.getCompileOutput());
        response.setExecutionTimeMs(execResult.getExecutionTimeMs());
        response.setMemoryUsedKb(execResult.getMemoryUsedKb());
        response.setStatus(execResult.getStatus());
        response.setExitCode(execResult.getExitCode());

        if (matchedTestCase != null) {
            response.setExpectedOutput(matchedTestCase.getExpectedOutput());
            boolean passed = codeExecutionService.outputsMatch(execResult.getStdout(), matchedTestCase.getExpectedOutput());
            response.setSamplePassed(passed && "ACCEPTED".equals(execResult.getStatus()));
        }

        return response;
    }

    /**
     * Submits code and evaluates against all sample and hidden test cases.
     * Evaluates output normalization and records per-test case results.
     * Never leaks hidden test inputs or outputs in the response.
     */
    @Transactional
    public SubmissionResponse submitCode(SubmitCodeRequest request, String userId) {
        String tenantId = TenantContext.getTenantId();
        PracticeProblemEntity problem = findProblemByIdOrSlug(request.getProblemId());

        if (!languageRegistry.isSupported(request.getLanguage())) {
            throw new BadRequestException("Unsupported programming language: " + request.getLanguage());
        }

        List<PracticeTestCaseEntity> testCases = testCaseRepository.findByProblemIdOrderByDisplayOrderAsc(problem.getId());
        if (testCases.isEmpty()) {
            throw new BadRequestException("This problem has no test cases configured for automated evaluation.");
        }

        PracticeSubmissionEntity submission = new PracticeSubmissionEntity();
        submission.setId("sub_" + UUID.randomUUID().toString().replace("-", ""));
        submission.setTenantId(tenantId);
        submission.setUserId(userId);
        submission.setProblemId(problem.getId());
        submission.setLanguage(request.getLanguage());
        submission.setCode(request.getCode());
        submission.setStatus("RUNNING");
        submission.setTotalCount(testCases.size());

        List<PracticeSubmissionResultEntity> resultEntities = new ArrayList<>();
        int passedCount = 0;
        int maxTime = 0;
        int maxMemory = 0;
        String overallVerdict = "ACCEPTED";
        String failureError = null;

        for (PracticeTestCaseEntity tc : testCases) {
            CodeExecutionResult res = codeExecutionService.execute(
                    request.getLanguage(),
                    request.getCode(),
                    tc.getInputData(),
                    problem.getTimeLimitMs(),
                    problem.getMemoryLimitKb()
            );

            PracticeSubmissionResultEntity re = new PracticeSubmissionResultEntity();
            re.setId("res_" + UUID.randomUUID().toString().replace("-", ""));
            re.setSubmission(submission);
            re.setTestCaseId(tc.getId());
            re.setHidden(tc.isHidden());
            re.setExecutionTimeMs(res.getExecutionTimeMs());
            re.setMemoryUsedKb(res.getMemoryUsedKb());

            maxTime = Math.max(maxTime, res.getExecutionTimeMs());
            maxMemory = Math.max(maxMemory, res.getMemoryUsedKb());

            if ("COMPILATION_ERROR".equals(res.getStatus())) {
                re.setStatus("FAILED");
                re.setErrorMessage(res.getCompileOutput());
                overallVerdict = "COMPILATION_ERROR";
                failureError = res.getCompileOutput();
                resultEntities.add(re);
                break; // Stop on compilation error
            } else if ("TIME_LIMIT_EXCEEDED".equals(res.getStatus())) {
                re.setStatus("TIMEOUT");
                re.setErrorMessage("Time Limit Exceeded");
                if ("ACCEPTED".equals(overallVerdict)) {
                    overallVerdict = "TIME_LIMIT_EXCEEDED";
                }
            } else if ("RUNTIME_ERROR".equals(res.getStatus())) {
                re.setStatus("ERROR");
                re.setErrorMessage(res.getStderr());
                if ("ACCEPTED".equals(overallVerdict)) {
                    overallVerdict = "RUNTIME_ERROR";
                    failureError = res.getStderr();
                }
            } else {
                re.setActualOutput(res.getStdout());
                boolean matched = codeExecutionService.outputsMatch(res.getStdout(), tc.getExpectedOutput());
                if (matched) {
                    re.setStatus("PASSED");
                    passedCount++;
                } else {
                    re.setStatus("FAILED");
                    if ("ACCEPTED".equals(overallVerdict)) {
                        overallVerdict = "WRONG_ANSWER";
                    }
                }
            }

            resultEntities.add(re);
        }

        int score = (int) Math.round(((double) passedCount / testCases.size()) * 100);

        submission.setStatus("COMPLETED");
        submission.setVerdict(overallVerdict);
        submission.setScore(score);
        submission.setPassedCount(passedCount);
        submission.setExecutionTimeMs(maxTime);
        submission.setMemoryUsedKb(maxMemory);
        submission.setErrorMessage(failureError);
        submission.setResults(resultEntities);

        submissionRepository.save(submission);

        // Award XP if first time accepted
        if ("ACCEPTED".equals(overallVerdict)) {
            awardCompletionXp(tenantId, userId, problem.getId());
        }

        return toSubmissionResponse(submission, problem.getTitle(), false);
    }

    private void awardCompletionXp(String tenantId, String userId, String problemId) {
        try {
            // Check if user has already solved this problem
            long acceptedCount = submissionRepository.countByTenantIdAndUserIdAndVerdict(tenantId, userId, "ACCEPTED");
            if (acceptedCount <= 1) { // 1 because current submission was just saved
                userRepository.findByIdAndTenantId(userId, tenantId).ifPresent(user -> {
                    user.setXpPoints(user.getXpPoints() + 25);
                    userRepository.save(user);
                    log.info("Awarded +25 XP to student {} for solving practice problem {}", userId, problemId);
                });
            }
        } catch (Exception e) {
            log.warn("Could not award XP to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Retrieves submission by ID with strict tenant and student ownership validation.
     * Hidden test case data is sanitized for students.
     */
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionById(String submissionId, String userId, boolean isAdmin) {
        String tenantId = TenantContext.getTenantId();
        PracticeSubmissionEntity submission = submissionRepository.findByTenantIdAndId(tenantId, submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (!isAdmin && !submission.getUserId().equals(userId)) {
            throw new ForbiddenException("You are not authorized to view this submission.");
        }

        String problemTitle = problemRepository.findById(submission.getProblemId())
                .map(PracticeProblemEntity::getTitle)
                .orElse("Practice Problem");

        return toSubmissionResponse(submission, problemTitle, isAdmin);
    }

    /**
     * Lists submissions by authenticated student.
     */
    @Transactional(readOnly = true)
    public Page<SubmissionResponse> getMySubmissions(String problemId, String userId, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        Page<PracticeSubmissionEntity> submissions;

        if (problemId != null && !problemId.isBlank()) {
            PracticeProblemEntity problem = findProblemByIdOrSlug(problemId);
            submissions = submissionRepository.findByTenantIdAndUserIdAndProblemIdOrderByCreatedAtDesc(
                    tenantId, userId, problem.getId(), pageable);
        } else {
            submissions = submissionRepository.findByTenantIdAndUserIdOrderByCreatedAtDesc(
                    tenantId, userId, pageable);
        }

        return submissions.map(sub -> {
            String title = problemRepository.findById(sub.getProblemId())
                    .map(PracticeProblemEntity::getTitle)
                    .orElse("Practice Problem");
            return toSubmissionResponse(sub, title, false);
        });
    }

    /**
     * Autosaves or updates user's draft code for a problem and language.
     */
    @Transactional
    public PracticeDraftDTO saveDraft(String problemId, String userId, SaveDraftRequest request) {
        String tenantId = TenantContext.getTenantId();
        PracticeProblemEntity problem = findProblemByIdOrSlug(problemId);

        PracticeDraftEntity draft = draftRepository.findByTenantIdAndUserIdAndProblemIdAndLanguage(
                tenantId, userId, problem.getId(), request.getLanguage().toLowerCase()
        ).orElseGet(() -> {
            PracticeDraftEntity d = new PracticeDraftEntity();
            d.setId("drf_" + UUID.randomUUID().toString().replace("-", ""));
            d.setTenantId(tenantId);
            d.setUserId(userId);
            d.setProblemId(problem.getId());
            d.setLanguage(request.getLanguage().toLowerCase());
            return d;
        });

        draft.setCode(request.getCode());
        draft.setUpdatedAt(Instant.now());
        draftRepository.save(draft);

        return new PracticeDraftDTO(draft.getId(), problem.getId(), draft.getLanguage(), draft.getCode(), draft.getUpdatedAt());
    }

    /**
     * Retrieves saved draft for a problem and language.
     */
    @Transactional(readOnly = true)
    public Optional<PracticeDraftDTO> getDraft(String problemId, String language, String userId) {
        String tenantId = TenantContext.getTenantId();
        PracticeProblemEntity problem = findProblemByIdOrSlug(problemId);

        if (language != null && !language.isBlank()) {
            return draftRepository.findByTenantIdAndUserIdAndProblemIdAndLanguage(tenantId, userId, problem.getId(), language.toLowerCase())
                    .map(d -> new PracticeDraftDTO(d.getId(), problem.getId(), d.getLanguage(), d.getCode(), d.getUpdatedAt()));
        }

        return draftRepository.findFirstByTenantIdAndUserIdAndProblemIdOrderByUpdatedAtDesc(tenantId, userId, problem.getId())
                .map(d -> new PracticeDraftDTO(d.getId(), problem.getId(), d.getLanguage(), d.getCode(), d.getUpdatedAt()));
    }

    // --- Admin Problem Management ---

    @Transactional
    public PracticeProblemDetailDTO createProblem(CreateProblemRequest request, String authorId) {
        String tenantId = TenantContext.getTenantId();
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug().toLowerCase().trim().replaceAll("[^a-z0-9]+", "-")
                : request.getTitle().toLowerCase().trim().replaceAll("[^a-z0-9]+", "-");

        if (problemRepository.existsByTenantIdAndSlug(tenantId, slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        PracticeProblemEntity entity = new PracticeProblemEntity();
        entity.setId("prob_" + UUID.randomUUID().toString().replace("-", ""));
        entity.setTenantId(tenantId);
        entity.setTitle(request.getTitle());
        entity.setSlug(slug);
        entity.setDescription(request.getDescription());
        entity.setDifficulty(request.getDifficulty());
        entity.setCategory(request.getCategory());
        entity.setTopicTags(request.getTopicTags());
        entity.setConstraints(request.getConstraints());
        entity.setHints(request.getHints());
        entity.setTimeLimitMs(request.getTimeLimitMs());
        entity.setMemoryLimitKb(request.getMemoryLimitKb());
        entity.setPublished(request.isPublished());
        entity.setAuthorId(authorId);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        problemRepository.save(entity);

        // Save starter templates
        if (request.getTemplates() != null) {
            for (Map.Entry<String, String> entry : request.getTemplates().entrySet()) {
                PracticeProblemTemplateEntity t = new PracticeProblemTemplateEntity();
                t.setId("tmpl_" + UUID.randomUUID().toString().replace("-", ""));
                t.setProblem(entity);
                t.setLanguage(entry.getKey().toLowerCase());
                t.setStarterCode(entry.getValue());
                templateRepository.save(t);
            }
        }

        // Save test cases
        if (request.getTestCases() != null) {
            int order = 0;
            for (PracticeTestCaseDTO tc : request.getTestCases()) {
                PracticeTestCaseEntity tcEntity = new PracticeTestCaseEntity();
                tcEntity.setId("tc_" + UUID.randomUUID().toString().replace("-", ""));
                tcEntity.setProblem(entity);
                tcEntity.setInputData(tc.getInputData());
                tcEntity.setExpectedOutput(tc.getExpectedOutput());
                tcEntity.setExplanation(tc.getExplanation());
                tcEntity.setHidden(tc.isHidden());
                tcEntity.setWeightPoints(tc.getWeightPoints() > 0 ? tc.getWeightPoints() : 10);
                tcEntity.setDisplayOrder(order++);
                testCaseRepository.save(tcEntity);
            }
        }

        return getProblemDetail(entity.getId(), true);
    }

    @Transactional
    public PracticeProblemDetailDTO updateProblem(String id, CreateProblemRequest request) {
        PracticeProblemEntity entity = findProblemByIdOrSlug(id);
        entity.setTitle(request.getTitle());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getDifficulty() != null) entity.setDifficulty(request.getDifficulty());
        if (request.getCategory() != null) entity.setCategory(request.getCategory());
        if (request.getTopicTags() != null) entity.setTopicTags(request.getTopicTags());
        if (request.getConstraints() != null) entity.setConstraints(request.getConstraints());
        if (request.getHints() != null) entity.setHints(request.getHints());
        entity.setTimeLimitMs(request.getTimeLimitMs());
        entity.setMemoryLimitKb(request.getMemoryLimitKb());
        entity.setPublished(request.isPublished());
        entity.setUpdatedAt(Instant.now());

        problemRepository.save(entity);

        if (request.getTemplates() != null) {
            templateRepository.deleteByProblemId(entity.getId());
            for (Map.Entry<String, String> entry : request.getTemplates().entrySet()) {
                PracticeProblemTemplateEntity t = new PracticeProblemTemplateEntity();
                t.setId("tmpl_" + UUID.randomUUID().toString().replace("-", ""));
                t.setProblem(entity);
                t.setLanguage(entry.getKey().toLowerCase());
                t.setStarterCode(entry.getValue());
                templateRepository.save(t);
            }
        }

        if (request.getTestCases() != null && !request.getTestCases().isEmpty()) {
            testCaseRepository.deleteByProblemId(entity.getId());
            int order = 0;
            for (PracticeTestCaseDTO tc : request.getTestCases()) {
                PracticeTestCaseEntity tcEntity = new PracticeTestCaseEntity();
                tcEntity.setId("tc_" + UUID.randomUUID().toString().replace("-", ""));
                tcEntity.setProblem(entity);
                tcEntity.setInputData(tc.getInputData());
                tcEntity.setExpectedOutput(tc.getExpectedOutput());
                tcEntity.setExplanation(tc.getExplanation());
                tcEntity.setHidden(tc.isHidden());
                tcEntity.setWeightPoints(tc.getWeightPoints() > 0 ? tc.getWeightPoints() : 10);
                tcEntity.setDisplayOrder(order++);
                testCaseRepository.save(tcEntity);
            }
        }

        return getProblemDetail(entity.getId(), true);
    }

    @Transactional
    public void deleteProblem(String id) {
        PracticeProblemEntity entity = findProblemByIdOrSlug(id);
        problemRepository.delete(entity);
    }

    // --- Helpers ---

    private PracticeProblemEntity findProblemByIdOrSlug(String idOrSlug) {
        String tenantId = TenantContext.getTenantId();
        return problemRepository.findByTenantIdAndId(tenantId, idOrSlug)
                .or(() -> problemRepository.findByTenantIdAndSlug(tenantId, idOrSlug))
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id or slug: " + idOrSlug));
    }

    private PracticeProblemSummaryDTO toSummaryDTO(PracticeProblemEntity entity) {
        PracticeProblemSummaryDTO dto = new PracticeProblemSummaryDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setSlug(entity.getSlug());
        dto.setDifficulty(entity.getDifficulty());
        dto.setCategory(entity.getCategory());
        dto.setTopicTags(entity.getTopicTags());
        dto.setTimeLimitMs(entity.getTimeLimitMs());
        dto.setMemoryLimitKb(entity.getMemoryLimitKb());
        dto.setPublished(entity.isPublished());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private PracticeTestCaseDTO toTestCaseDTO(PracticeTestCaseEntity entity, boolean redactHidden) {
        PracticeTestCaseDTO dto = new PracticeTestCaseDTO();
        dto.setId(entity.getId());
        dto.setHidden(entity.isHidden());
        dto.setWeightPoints(entity.getWeightPoints());
        dto.setDisplayOrder(entity.getDisplayOrder());

        if (entity.isHidden() && redactHidden) {
            dto.setInputData("[Hidden Test Case]");
            dto.setExpectedOutput("[Hidden Test Case]");
            dto.setExplanation(null);
        } else {
            dto.setInputData(entity.getInputData());
            dto.setExpectedOutput(entity.getExpectedOutput());
            dto.setExplanation(entity.getExplanation());
        }

        return dto;
    }

    private SubmissionResponse toSubmissionResponse(PracticeSubmissionEntity entity, String problemTitle, boolean isAdmin) {
        SubmissionResponse response = new SubmissionResponse();
        response.setId(entity.getId());
        response.setProblemId(entity.getProblemId());
        response.setProblemTitle(problemTitle);
        response.setLanguage(entity.getLanguage());
        response.setStatus(entity.getStatus());
        response.setVerdict(entity.getVerdict());
        response.setScore(entity.getScore());
        response.setPassedCount(entity.getPassedCount());
        response.setTotalCount(entity.getTotalCount());
        response.setExecutionTimeMs(entity.getExecutionTimeMs());
        response.setMemoryUsedKb(entity.getMemoryUsedKb());
        response.setErrorMessage(entity.getErrorMessage());
        response.setCreatedAt(entity.getCreatedAt());

        List<PracticeSubmissionResultEntity> results = submissionResultRepository.findBySubmissionId(entity.getId());
        List<SubmissionResultItemDTO> resultDTOs = new ArrayList<>();

        for (PracticeSubmissionResultEntity r : results) {
            SubmissionResultItemDTO item = new SubmissionResultItemDTO();
            item.setTestCaseId(r.getTestCaseId());
            item.setHidden(r.isHidden());
            item.setStatus(r.getStatus());
            item.setExecutionTimeMs(r.getExecutionTimeMs());
            item.setMemoryUsedKb(r.getMemoryUsedKb());

            // Protect hidden test cases from leaking to students
            if (r.isHidden() && !isAdmin) {
                item.setInputData("[Hidden Test Case]");
                item.setExpectedOutput("[Hidden Test Case]");
                item.setActualOutput("[Hidden Test Case]");
                item.setErrorMessage(null); // Never leak error trace from hidden test case
            } else {
                item.setActualOutput(r.getActualOutput());
                item.setErrorMessage(r.getErrorMessage());
                if (r.getTestCaseId() != null) {
                    testCaseRepository.findById(r.getTestCaseId()).ifPresent(tc -> {
                        item.setInputData(tc.getInputData());
                        item.setExpectedOutput(tc.getExpectedOutput());
                        item.setDisplayOrder(tc.getDisplayOrder());
                    });
                }
            }
            resultDTOs.add(item);
        }

        response.setResults(resultDTOs);
        return response;
    }
}

