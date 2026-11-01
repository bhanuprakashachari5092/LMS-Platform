package com.shaivikagroups.lms.practice.dto;

public class RunCodeResponse {

    private String stdout;
    private String stderr;
    private String compileOutput;
    private int executionTimeMs;
    private int memoryUsedKb;
    private String status; // ACCEPTED, WRONG_ANSWER, COMPILATION_ERROR, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED
    private int exitCode;
    private String expectedOutput;
    private Boolean samplePassed;

    public RunCodeResponse() {}

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getExitCode() {
        return exitCode;
    }

    public void setExitCode(int exitCode) {
        this.exitCode = exitCode;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public Boolean getSamplePassed() {
        return samplePassed;
    }

    public void setSamplePassed(Boolean samplePassed) {
        this.samplePassed = samplePassed;
    }
}
