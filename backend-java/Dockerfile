# ==============================================================================
# KaizenQ LMS - Enterprise Spring Boot Backend Multi-Stage Dockerfile
# Java Version: Eclipse Temurin 17 LTS (Alpine)
# Deployment Target: Render Web Service (Docker Runtime)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Package Executable Spring Boot JAR
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /workspace

# Copy Maven Project Object Model (POM)
COPY pom.xml ./

# Pre-fetch dependencies into Docker layer cache
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY src ./src

# Package production application artifact
RUN mvn clean package -DskipTests -B

# Isolate ONLY the executable JAR (exclude .original unshaded artifact)
RUN mkdir -p /build/out && \
    find target/ -maxdepth 1 -name "*.jar" ! -name "*.original" -exec cp {} /build/out/app.jar \; && \
    ls -lh /build/out/app.jar

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production JRE Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Install curl / wget for container health checks
RUN apk add --no-cache curl wget bash

# Create non-root system user and group for hardened container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create runtime directories with appropriate ownership
RUN mkdir -p /app/logs /tmp && chown -R appuser:appgroup /app /tmp

# Copy isolated executable JAR from builder stage
COPY --from=builder --chown=appuser:appgroup /build/out/app.jar /app/app.jar

# Switch to non-root user
USER appuser

# Expose production port (Render binds to dynamic $PORT)
EXPOSE 8080

# Environment Defaults for Container Execution
ENV SPRING_PROFILES_ACTIVE=prod \
    PORT=8080 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Container Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:${PORT:-8080}/actuator/health || \
      wget -q --spider http://127.0.0.1:${PORT:-8080}/health || exit 1

# Production Entrypoint with dynamic port injection and container memory tuning
ENTRYPOINT ["sh", "-c", "echo '[KAIZENQ-INIT] Starting KaizenQ Spring Boot Backend on Port '${PORT:-8080}' [Profile: '${SPRING_PROFILES_ACTIVE:-prod}']...' && exec java -XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]
