package com.shaivikagroups.lms.quiz;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shaivikagroups.lms.common.BadRequestException;
import com.shaivikagroups.lms.common.ResourceNotFoundException;
import com.shaivikagroups.lms.enrollment.EnrollmentRepository;
import com.shaivikagroups.lms.progress.ProgressService;
import com.shaivikagroups.lms.progress.ProgressUpdateRequest;
import com.shaivikagroups.lms.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressService progressService;
    private final ObjectMapper objectMapper;

    public QuizService(
            QuizRepository quizRepository,
            QuizQuestionRepository questionRepository,
            QuizOptionRepository optionRepository,
            QuizAttemptRepository attemptRepository,
            EnrollmentRepository enrollmentRepository,
            ProgressService progressService) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.attemptRepository = attemptRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.progressService = progressService;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public QuizResponse saveQuiz(QuizRequest req, String existingQuizId) {
        QuizEntity entity;
        if (existingQuizId != null && !existingQuizId.isBlank()) {
            entity = quizRepository.findById(existingQuizId)
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + existingQuizId));
            // Remove old questions to replace with incoming
            entity.getQuestions().clear();
        } else {
            entity = new QuizEntity();
            entity.setId("quiz_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        }

        entity.setCourseId(req.getCourseId());
        entity.setLessonId(req.getLessonId());
        entity.setTitle(req.getTitle());
        entity.setDescription(req.getDescription());
        entity.setTimeLimitMinutes(req.getTimeLimitMinutes() > 0 ? req.getTimeLimitMinutes() : 15);
        entity.setPassingScore(req.getPassingScore() > 0 ? req.getPassingScore() : 70);
        entity.setMaxAttempts(req.getMaxAttempts() > 0 ? req.getMaxAttempts() : 3);
        entity.setShuffleQuestions(req.isShuffleQuestions());
        entity.setUpdatedAt(Instant.now());

        if (req.getQuestions() != null) {
            int qIndex = 1;
            for (QuizQuestionDTO qDto : req.getQuestions()) {
                QuizQuestionEntity qEntity = new QuizQuestionEntity();
                qEntity.setId("q_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
                qEntity.setOrderIndex(qDto.getOrderIndex() > 0 ? qDto.getOrderIndex() : qIndex++);
                qEntity.setQuestionText(qDto.getQuestionText());
                try {
                    qEntity.setQuestionType(QuestionType.valueOf(qDto.getQuestionType().toUpperCase()));
                } catch (Exception e) {
                    qEntity.setQuestionType(QuestionType.MULTIPLE_CHOICE);
                }
                qEntity.setExplanation(qDto.getExplanation());
                qEntity.setPoints(qDto.getPoints() > 0 ? qDto.getPoints() : 1);

                if (qDto.getOptions() != null) {
                    int optIndex = 1;
                    for (QuizOptionDTO optDto : qDto.getOptions()) {
                        QuizOptionEntity optEntity = new QuizOptionEntity();
                        optEntity.setId("opt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
                        optEntity.setOrderIndex(optDto.getOrderIndex() > 0 ? optDto.getOrderIndex() : optIndex++);
                        optEntity.setOptionText(optDto.getOptionText());
                        optEntity.setCorrect(Boolean.TRUE.equals(optDto.getIsCorrect()));
                        qEntity.addOption(optEntity);
                    }
                }
                entity.addQuestion(qEntity);
            }
        }

        QuizEntity saved = quizRepository.save(entity);
        return mapToResponse(saved, true);
    }

    @Transactional(readOnly = true)
    public QuizResponse getQuizById(String quizId, boolean includeAnswers) {
        QuizEntity entity = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));
        return mapToResponse(entity, includeAnswers);
    }

    @Transactional(readOnly = true)
    public List<QuizResponse> getQuizzesByCourse(String courseId, boolean includeAnswers) {
        return quizRepository.findByCourseId(courseId).stream()
                .map(q -> mapToResponse(q, includeAnswers))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizResponse getQuizByLesson(String lessonId, boolean includeAnswers) {
        QuizEntity entity = quizRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found for lesson: " + lessonId));
        return mapToResponse(entity, includeAnswers);
    }

    @Transactional
    public void deleteQuiz(String quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new ResourceNotFoundException("Quiz not found: " + quizId);
        }
        quizRepository.deleteById(quizId);
    }

    @Transactional
    public QuizStartResponse startAttempt(String quizId, String userId) {
        String tenantId = TenantContext.getTenantId();
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        int attemptCount = attemptRepository.countByTenantIdAndUserIdAndQuizId(tenantId, userId, quizId);
        if (quiz.getMaxAttempts() > 0 && attemptCount >= quiz.getMaxAttempts()) {
            throw new BadRequestException("Maximum attempt limit (" + quiz.getMaxAttempts() + ") reached for this quiz.");
        }

        String attemptId = "att_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        int timeLimitSec = quiz.getTimeLimitMinutes() * 60;
        Instant expiresAt = Instant.now().plusSeconds(timeLimitSec);

        // Student view of the quiz (answers hidden)
        QuizResponse studentQuiz = mapToResponse(quiz, false);

        return new QuizStartResponse(attemptId, quizId, timeLimitSec, expiresAt, studentQuiz);
    }

    @Transactional
    public QuizAttemptResponse submitAttempt(String quizId, String userId, QuizSubmitRequest request) {
        String tenantId = TenantContext.getTenantId();
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        int previousAttempts = attemptRepository.countByTenantIdAndUserIdAndQuizId(tenantId, userId, quizId);
        if (quiz.getMaxAttempts() > 0 && previousAttempts >= quiz.getMaxAttempts()) {
            throw new BadRequestException("Maximum attempt limit reached for this quiz.");
        }

        Map<String, Object> submittedAnswers = request.getAnswers() != null ? request.getAnswers() : Collections.emptyMap();
        List<QuizAttemptResponse.QuestionResultDTO> questionResults = new ArrayList<>();

        int score = 0;
        int totalPoints = 0;

        for (QuizQuestionEntity q : quiz.getQuestions()) {
            totalPoints += q.getPoints();
            Object rawAnswer = submittedAnswers.get(q.getId());
            String studentAnswerStr = rawAnswer != null ? String.valueOf(rawAnswer).trim() : "";

            boolean isCorrect = false;
            Object correctAnswerObj = null;

            if (q.getQuestionType() == QuestionType.MULTIPLE_CHOICE || q.getQuestionType() == QuestionType.TRUE_FALSE) {
                // Find correct option(s)
                for (QuizOptionEntity opt : q.getOptions()) {
                    if (opt.isCorrect()) {
                        correctAnswerObj = opt.getId();
                        if (opt.getId().equalsIgnoreCase(studentAnswerStr) ||
                            opt.getOptionText().equalsIgnoreCase(studentAnswerStr)) {
                            isCorrect = true;
                        }
                    }
                }
            } else if (q.getQuestionType() == QuestionType.SHORT_ANSWER) {
                // Compare with any marked correct option text
                for (QuizOptionEntity opt : q.getOptions()) {
                    if (opt.isCorrect()) {
                        correctAnswerObj = opt.getOptionText();
                        if (opt.getOptionText().trim().equalsIgnoreCase(studentAnswerStr)) {
                            isCorrect = true;
                        }
                    }
                }
            }

            int pointsAwarded = isCorrect ? q.getPoints() : 0;
            score += pointsAwarded;

            questionResults.add(new QuizAttemptResponse.QuestionResultDTO(
                    q.getId(),
                    q.getQuestionText(),
                    studentAnswerStr,
                    correctAnswerObj,
                    isCorrect,
                    pointsAwarded,
                    q.getPoints(),
                    q.getExplanation()
            ));
        }

        int percentage = totalPoints > 0 ? (int) Math.round(((double) score / totalPoints) * 100.0) : 0;
        boolean passed = percentage >= quiz.getPassingScore();

        QuizAttemptEntity attempt = new QuizAttemptEntity();
        attempt.setId(request.getAttemptId() != null && !request.getAttemptId().isBlank()
                ? request.getAttemptId()
                : "att_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        attempt.setTenantId(tenantId);
        attempt.setUserId(userId);
        attempt.setQuizId(quizId);
        attempt.setScore(score);
        attempt.setPassed(passed);
        attempt.setAttemptNumber(previousAttempts + 1);
        attempt.setTimeSpentSeconds(request.getTimeSpentSeconds());
        attempt.setAttemptedAt(Instant.now());

        Map<String, Object> payloadMap = new HashMap<>();
        payloadMap.put("submittedAnswers", submittedAnswers);
        payloadMap.put("questionResults", questionResults);
        payloadMap.put("totalPoints", totalPoints);
        payloadMap.put("percentage", percentage);

        try {
            attempt.setAnswersPayload(objectMapper.writeValueAsString(payloadMap));
        } catch (JsonProcessingException e) {
            attempt.setAnswersPayload("{}");
        }

        attemptRepository.save(attempt);

        // If passed and quiz is attached to a lesson, automatically record progress if enrolled
        if (passed && quiz.getLessonId() != null && !quiz.getLessonId().isBlank()) {
            if (enrollmentRepository.findByTenantIdAndUserIdAndCourseId(tenantId, userId, quiz.getCourseId()).isPresent()) {
                try {
                    progressService.updateLessonProgress(userId, quiz.getCourseId(),
                            new ProgressUpdateRequest(quiz.getLessonId(), "COMPLETED", request.getTimeSpentSeconds()));
                } catch (Exception e) {
                    // Log and don't fail quiz attempt completion
                }
            }
        }

        QuizAttemptResponse resp = new QuizAttemptResponse();
        resp.setId(attempt.getId());
        resp.setQuizId(quizId);
        resp.setUserId(userId);
        resp.setScore(score);
        resp.setTotalPoints(totalPoints);
        resp.setPercentage(percentage);
        resp.setPassed(passed);
        resp.setAttemptNumber(attempt.getAttemptNumber());
        resp.setTimeSpentSeconds(attempt.getTimeSpentSeconds());
        resp.setAttemptedAt(attempt.getAttemptedAt());
        resp.setAnswers(submittedAnswers);
        resp.setQuestionResults(questionResults);

        return resp;
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getAttemptHistory(String quizId, String userId) {
        String tenantId = TenantContext.getTenantId();
        List<QuizAttemptEntity> attempts = attemptRepository.findByTenantIdAndUserIdAndQuizIdOrderByAttemptNumberDesc(
                tenantId, userId, quizId);

        return attempts.stream().map(this::mapAttemptToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizAnalyticsResponse getQuizAnalytics(String quizId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        List<QuizAttemptEntity> attempts = attemptRepository.findByQuizIdOrderByAttemptedAtDesc(quizId);

        QuizAnalyticsResponse analytics = new QuizAnalyticsResponse();
        analytics.setTotalAttempts(attempts.size());

        if (attempts.isEmpty()) {
            analytics.setPassCount(0);
            analytics.setFailCount(0);
            analytics.setPassRate(0.0);
            analytics.setAverageScore(0.0);
            return analytics;
        }

        int passCount = 0;
        int totalScore = 0;
        for (QuizAttemptEntity att : attempts) {
            if (att.isPassed()) {
                passCount++;
            }
            totalScore += att.getScore();
        }

        analytics.setPassCount(passCount);
        analytics.setFailCount(attempts.size() - passCount);
        analytics.setPassRate(Math.round(((double) passCount / attempts.size()) * 1000.0) / 10.0);
        analytics.setAverageScore(Math.round(((double) totalScore / attempts.size()) * 10.0) / 10.0);

        return analytics;
    }

    private QuizResponse mapToResponse(QuizEntity entity, boolean includeAnswers) {
        QuizResponse resp = new QuizResponse();
        resp.setId(entity.getId());
        resp.setCourseId(entity.getCourseId());
        resp.setLessonId(entity.getLessonId());
        resp.setTitle(entity.getTitle());
        resp.setDescription(entity.getDescription());
        resp.setTimeLimitMinutes(entity.getTimeLimitMinutes());
        resp.setPassingScore(entity.getPassingScore());
        resp.setMaxAttempts(entity.getMaxAttempts());
        resp.setShuffleQuestions(entity.isShuffleQuestions());

        int totalPoints = 0;
        List<QuizQuestionDTO> qDtos = new ArrayList<>();
        for (QuizQuestionEntity q : entity.getQuestions()) {
            totalPoints += q.getPoints();
            QuizQuestionDTO qDto = new QuizQuestionDTO();
            qDto.setId(q.getId());
            qDto.setOrderIndex(q.getOrderIndex());
            qDto.setQuestionText(q.getQuestionText());
            qDto.setQuestionType(q.getQuestionType().name());
            qDto.setPoints(q.getPoints());
            // Only reveal explanation if includeAnswers is true
            if (includeAnswers) {
                qDto.setExplanation(q.getExplanation());
            }

            List<QuizOptionDTO> optDtos = new ArrayList<>();
            for (QuizOptionEntity opt : q.getOptions()) {
                QuizOptionDTO optDto = new QuizOptionDTO();
                optDto.setId(opt.getId());
                optDto.setOrderIndex(opt.getOrderIndex());
                optDto.setOptionText(opt.getOptionText());
                if (includeAnswers) {
                    optDto.setIsCorrect(opt.isCorrect());
                } else {
                    optDto.setIsCorrect(null); // Mask from student prior to submission
                }
                optDtos.add(optDto);
            }
            qDto.setOptions(optDtos);
            qDtos.add(qDto);
        }

        resp.setTotalQuestions(qDtos.size());
        resp.setTotalPoints(totalPoints);
        resp.setQuestions(qDtos);

        return resp;
    }

    private QuizAttemptResponse mapAttemptToResponse(QuizAttemptEntity entity) {
        QuizAttemptResponse resp = new QuizAttemptResponse();
        resp.setId(entity.getId());
        resp.setQuizId(entity.getQuizId());
        resp.setUserId(entity.getUserId());
        resp.setScore(entity.getScore());
        resp.setPassed(entity.isPassed());
        resp.setAttemptNumber(entity.getAttemptNumber());
        resp.setTimeSpentSeconds(entity.getTimeSpentSeconds());
        resp.setAttemptedAt(entity.getAttemptedAt());

        try {
            Map<String, Object> map = objectMapper.readValue(entity.getAnswersPayload(), new TypeReference<>() {});
            if (map.containsKey("percentage")) {
                resp.setPercentage(((Number) map.get("percentage")).intValue());
            }
            if (map.containsKey("totalPoints")) {
                resp.setTotalPoints(((Number) map.get("totalPoints")).intValue());
            }
            if (map.containsKey("submittedAnswers")) {
                resp.setAnswers((Map<String, Object>) map.get("submittedAnswers"));
            }
        } catch (Exception e) {
            // ignore
        }

        return resp;
    }
}
