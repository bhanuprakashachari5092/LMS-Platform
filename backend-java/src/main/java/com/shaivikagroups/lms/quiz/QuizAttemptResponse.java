package com.shaivikagroups.lms.quiz;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class QuizAttemptResponse {
    private String id;
    private String quizId;
    private String userId;
    private int score;
    private int totalPoints;
    private int percentage;
    private boolean passed;
    private int attemptNumber;
    private int timeSpentSeconds;
    private Instant attemptedAt;
    private Map<String, Object> answers;
    private List<QuestionResultDTO> questionResults = new ArrayList<>();

    public static class QuestionResultDTO {
        private String questionId;
        private String questionText;
        private Object studentAnswer;
        private Object correctAnswer;
        private boolean correct;
        private int pointsAwarded;
        private int maxPoints;
        private String explanation;

        public QuestionResultDTO() {}

        public QuestionResultDTO(String questionId, String questionText, Object studentAnswer,
                                 Object correctAnswer, boolean correct, int pointsAwarded,
                                 int maxPoints, String explanation) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.studentAnswer = studentAnswer;
            this.correctAnswer = correctAnswer;
            this.correct = correct;
            this.pointsAwarded = pointsAwarded;
            this.maxPoints = maxPoints;
            this.explanation = explanation;
        }

        public String getQuestionId() {
            return questionId;
        }

        public void setQuestionId(String questionId) {
            this.questionId = questionId;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public Object getStudentAnswer() {
            return studentAnswer;
        }

        public void setStudentAnswer(Object studentAnswer) {
            this.studentAnswer = studentAnswer;
        }

        public Object getCorrectAnswer() {
            return correctAnswer;
        }

        public void setCorrectAnswer(Object correctAnswer) {
            this.correctAnswer = correctAnswer;
        }

        public boolean isCorrect() {
            return correct;
        }

        public void setCorrect(boolean correct) {
            this.correct = correct;
        }

        public int getPointsAwarded() {
            return pointsAwarded;
        }

        public void setPointsAwarded(int pointsAwarded) {
            this.pointsAwarded = pointsAwarded;
        }

        public int getMaxPoints() {
            return maxPoints;
        }

        public void setMaxPoints(int maxPoints) {
            this.maxPoints = maxPoints;
        }

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }

    public QuizAttemptResponse() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuizId() {
        return quizId;
    }

    public void setQuizId(String quizId) {
        this.quizId = quizId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public int getPercentage() {
        return percentage;
    }

    public void setPercentage(int percentage) {
        this.percentage = percentage;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(int attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public int getTimeSpentSeconds() {
        return timeSpentSeconds;
    }

    public void setTimeSpentSeconds(int timeSpentSeconds) {
        this.timeSpentSeconds = timeSpentSeconds;
    }

    public Instant getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(Instant attemptedAt) {
        this.attemptedAt = attemptedAt;
    }

    public Map<String, Object> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, Object> answers) {
        this.answers = answers;
    }

    public List<QuestionResultDTO> getQuestionResults() {
        return questionResults;
    }

    public void setQuestionResults(List<QuestionResultDTO> questionResults) {
        this.questionResults = questionResults;
    }
}

