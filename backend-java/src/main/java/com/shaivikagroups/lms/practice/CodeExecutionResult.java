package com.shaivikagroups.lms.practice;

public class CodeExecutionResult {

    private String stdout;
    private String stderr;
    private String compileOutput;
    private String status; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, COMPILATION_ERROR, RUNTIME_ERROR, INTERNAL_JUDGE_ERROR
    private int executionTimeMs;
    private int memoryUsedKb;
    private int exitCode;

    public CodeExecutionResult() {}

    public CodeExecutionResult(String stdout, String stderr, String compileOutput, String status, int executionTimeMs, int memoryUsedKb, int exitCode) {
        this.stdout = stdout;
        this.stderr = stderr;
        this.compileOutput = compileOutput;
        this.status = status;
        this.executionTimeMs = executionTimeMs;
        this.memoryUsedKb = memoryUsedKb;
        this.exitCode = exitCode;
    }

    public static CodeExecutionResult success(String stdout, int timeMs, int memoryKb) {
        return new CodeExecutionResult(stdout, null, null, "ACCEPTED", timeMs, memoryKb, 0);
    }

    public static CodeExecutionResult compilationError(String compileOutput) {
        return new CodeExecutionResult(null, null, compileOutput, "COMPILATION_ERROR", 0, 0, 1);
    }

    public static CodeExecutionResult runtimeError(String stderr, int exitCode) {
        return new CodeExecutionResult(null, stderr, null, "RUNTIME_ERROR", 0, 0, exitCode);
    }

    public static CodeExecutionResult timeLimitExceeded(int timeLimitMs) {
        return new CodeExecutionResult(null, "Time limit exceeded", null, "TIME_LIMIT_EXCEEDED", timeLimitMs, 0, 124);
    }

    public static CodeExecutionResult internalError(String message) {
        return new CodeExecutionResult(null, message, null, "INTERNAL_JUDGE_ERROR", 0, 0, 500);
    }

    public String getStdout() {
        return stdout;
    }

    public void setStdout(String stdout) {
        this.stdout = stdout;
    }

    public String getStderr() {
        return stderr;
    }

    public void setStderr(String stderr) {
        this.stderr = stderr;
    }

    public String getCompileOutput() {
        return compileOutput;
    }

    public void setCompileOutput(String compileOutput) {
        this.compileOutput = compileOutput;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(int executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public int getMemoryUsedKb() {
        return memoryUsedKb;
    }

    public void setMemoryUsedKb(int memoryUsedKb) {
        this.memoryUsedKb = memoryUsedKb;
    }

    public int getExitCode() {
        return exitCode;
    }

    public void setExitCode(int exitCode) {
        this.exitCode = exitCode;
    }
}

