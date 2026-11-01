@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script for Windows (KaizenQ LMS Java Backend)
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "WRAPPER_DIR=%~dp0.mvn\wrapper"
set "MAVEN_VERSION=3.9.9"
set "MAVEN_USER_HOME=%USERPROFILE%\.m2"
set "MAVEN_HOME=%MAVEN_USER_HOME%\wrapper\dists\apache-maven-%MAVEN_VERSION%"
set "MAVEN_ZIP=%MAVEN_USER_HOME%\wrapper\dists\apache-maven-%MAVEN_VERSION%-bin.zip"
set "MAVEN_CMD=%MAVEN_HOME%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd"

if exist "%MAVEN_CMD%" goto run_maven

echo [INFO] Apache Maven %MAVEN_VERSION% not found. Downloading Maven distribution...
if not exist "%MAVEN_USER_HOME%\wrapper\dists" mkdir "%MAVEN_USER_HOME%\wrapper\dists"

powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip', '%MAVEN_ZIP%')"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to download Apache Maven.
    exit /b 1
)

echo [INFO] Extracting Maven distribution...
powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_HOME%' -Force"

:run_maven
"%MAVEN_CMD%" %*
exit /b %ERRORLEVEL%

