# ==============================================================================
# Multi-stage Dockerfile for Shaivika LMS SaaS Spring Boot Backend (Java 21 LTS)
# ==============================================================================

# Stage 1: Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Install dos2unix and bash
RUN apk add --no-cache bash dos2unix

# Copy Maven Wrapper and POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN dos2unix mvnw && chmod +x mvnw

# Resolve dependencies in cache
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build application JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Production runtime stage
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Create a non-root system user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled JAR from builder stage
COPY --from=builder --chown=appuser:appgroup /workspace/target/*.jar /app/app.jar

# Switch to non-root user
USER appuser

# Expose default application port
EXPOSE 5000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:${PORT:-5000}/health || exit 1

# Environment defaults
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=5000

# Start command
ENTRYPOINT ["sh", "-c", "java -XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-5000} -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]

