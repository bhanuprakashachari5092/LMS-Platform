# KaizenQ LMS – Java Spring Boot Backend Docker & Render Deployment Guide

This guide provides end-to-end instructions for containerizing, testing, and deploying the **KaizenQ LMS Java Spring Boot backend** to **Render** using Docker and Eclipse Temurin Java 17 LTS.

---

## 1. Architecture Overview

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Spring Boot 3.3.4 | RESTful API backend with Spring Security, JPA/Hibernate, Actuator |
| **Java Version** | Eclipse Temurin 17 LTS | Multi-stage Docker build targeting Java 17 runtime |
| **Container Base** | `eclipse-temurin:17-jre-alpine` | Lightweight, hardened Linux Alpine runtime (~160MB image) |
| **Container User** | `appuser:appgroup` (non-root) | Least-privilege container execution |
| **Target Port** | `8080` (Render `$PORT`) | Dynamic port assignment via `${PORT:-8080}` |
| **Database** | PostgreSQL | Neon / Render Managed PostgreSQL with HikariCP connection pooling |
| **Email Service** | Gmail SMTP (STARTTLS) | Automated applicant confirmations and HR notifications |
| **Sheet Tracking** | Google Apps Script Webhook | Bidirectional applicant sync to Google Sheets |
| **Deployment Platform** | Render Web Service (Docker) | Managed container deployment with zero-downtime rolling deploys |

---

## 2. Prerequisites

1. **Docker Desktop** (version 24.0 or later) installed and running locally.
2. **Java 17 JDK** and **Maven 3.9+** (or use the included `./mvnw` wrapper).
3. **Render Account**: [render.com](https://render.com).
4. **PostgreSQL Database**: A running instance (Render PostgreSQL, Neon, AWS RDS, or local Docker).
5. **Gmail App Password**: 16-character App Password generated from Google Account (Security &rarr; 2-Step Verification &rarr; App Passwords).
6. **Google Sheets Webhook**: Google Apps Script Web App deployed with access set to *Anyone*.

---

## 3. Local Docker Build & Test

### 3.1 Build the Multi-Stage Docker Image

Run from the `backend-java/` directory:

```powershell
# Windows PowerShell
docker build -t kaizenq-lms-backend:latest .
```

```bash
# Linux / macOS
docker build -t kaizenq-lms-backend:latest .
```

The multi-stage build will:
1. Compile 249+ Java classes using `maven:3.9.9-eclipse-temurin-17-alpine`.
2. Repackage the fat Spring Boot executable JAR (`target/lms-backend-1.0.0-SNAPSHOT.jar`).
3. Isolate the executable JAR (excluding unshaded `.original` archive).
4. Copy the isolated JAR into `eclipse-temurin:17-jre-alpine`.
5. Set up the non-root `appuser` system user.

---

### 3.2 Run the Docker Container Locally

```powershell
# Windows PowerShell
docker run --rm -p 8080:8080 `
  -e SPRING_PROFILES_ACTIVE=dev `
  -e PORT=8080 `
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/kaizenq_lms" `
  -e JWT_SECRET="kaizenq_production_jwt_secret_key_2026_at_least_256_bits_long!" `
  --name kaizenq-backend `
  kaizenq-lms-backend:latest
```

```bash
# Linux / macOS
docker run --rm -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e PORT=8080 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/kaizenq_lms" \
  -e JWT_SECRET="kaizenq_production_jwt_secret_key_2026_at_least_256_bits_long!" \
  --name kaizenq-backend \
  kaizenq-lms-backend:latest
```

---

### 3.3 Verify Container Probes

Test health check endpoints:

```bash
# Health check probe (Used by Render / Docker HEALTHCHECK)
curl -i http://localhost:8080/health

# Spring Boot Actuator probe
curl -i http://localhost:8080/actuator/health

# Root diagnostic endpoint
curl -i http://localhost:8080/
```

Expected response (`200 OK`):
```json
{
  "status": "healthy",
  "uptime": 12,
  "timestamp": "2026-11-07T11:00:00Z",
  "version": "2.0.0"
}
```

---

## 4. Deploying to Render (Step-by-Step)

### Step 1: Create a New Web Service
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** &rarr; **Web Service**.
3. Select **Build and deploy from a Git repository**.
4. Choose the repository: `bhanuprakashachari5092/LMS-Platform` (Branch: `main`).

### Step 2: Configure Service Details
- **Name**: `kaizenq-lms-backend` (or your preferred service name)
- **Region**: Choose closest to your audience (e.g., `Singapore` or `Frankfurt`)
- **Root Directory**: `backend-java` *(Critical: Tells Render where the Dockerfile and code live)*
- **Environment**: `Docker`
- **Plan**: `Starter` ($7/mo) or `Standard` (512MB - 1GB RAM recommended for JVM)

### Step 3: Configure Health Check Path
Under **Advanced**:
- **Health Check Path**: `/actuator/health` (or `/health`)
- Render will poll this endpoint during rolling deployments to ensure zero downtime.

---

## 5. Production Environment Variables Reference

Configure these environment variables in Render under **Environment**:

| Variable Name | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | **Yes** | `prod` | Activates production database pooling and logging |
| `DATABASE_URL` | **Yes** | `postgres://user:pass@host.oregon-postgres.render.com/kaizenq_lms` | PostgreSQL connection string (Render provides this automatically when linking managed DB) |
| `JWT_SECRET` | **Yes** | `kaizenq_production_jwt_secret_key_2026_at_least_256_bits_long!` | Secret key for signing and verifying JSON Web Tokens (min 32 chars) |
| `CORS_ORIGIN` | **Yes** | `https://www.kaizenq.in,https://kaizenq.in,https://shaivika-lms.vercel.app` | Comma-separated list of allowed frontend origins |
| `PORT` | Auto | `8080` | Assigned automatically by Render; Spring Boot binds dynamically |
| `GMAIL_USERNAME` | Optional | `kaizenqlms@gmail.com` | Gmail account for SMTP email dispatch |
| `GMAIL_APP_PASSWORD` | Optional | `xxxx xxxx xxxx xxxx` | 16-character Google App Password for SMTP authentication |
| `HR_NOTIFICATION_EMAIL` | Optional | `kaizenqlms@gmail.com` | Destination inbox for candidate internship application notifications |
| `GOOGLE_SHEET_ID` | Optional | `1og9L7aU0R4_30uavzj17PZGAlGFt70VxVEwJ1WKKy_w` | Google Sheet ID for candidate applications |
| `GOOGLE_SHEET_NAME` | Optional | `Applications` | Target sheet name within Google Spreadsheet |
| `GOOGLE_APPS_SCRIPT_URL`| Optional | `https://script.google.com/macros/s/AKfycbwG4HnE51tX3wDqLw6b6w9jR2L5vU/exec` | Apps Script webhook URL for candidate sheet sync |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Gemini API key for AI Tutor & Mentor features |
| `JUDGE0_API_KEY` | Optional | `...` | RapidAPI Judge0 key for cloud code execution |
| `RAZORPAY_KEY_ID` | Optional | `rzp_live_...` | Razorpay Key ID for course payment processing |
| `RAZORPAY_KEY_SECRET` | Optional | `...` | Razorpay Key Secret |

---

## 6. Key Application Endpoints

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/health` | `GET` | Public | Platform health & uptime diagnostic probe |
| `/actuator/health` | `GET` | Public | Spring Boot Actuator readiness & liveness probe |
| `/api/v1/careers/openings` | `GET` | Public | Browse open internship and career positions |
| `/api/v1/careers/apply` | `POST` | Public | Submit candidate internship application |
| `/api/internship-applications` | `POST` | Public | Secondary direct endpoint for internship application submission |
| `/api/v1/admin/careers/applications` | `GET` | Admin | Review candidate applications with filter/sort |
| `/api/v1/admin/careers/applications/export` | `GET` | Admin | Export application records to CSV format |

---

## 7. Troubleshooting & Common Issues

### Issue 1: Container OOM (Out Of Memory / Exit Code 137)
- **Cause**: JVM heap exceeded Render instance memory limit.
- **Solution**: The Dockerfile already configures `-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError`. Ensure your Render service plan has at least 512MB RAM. For high-volume production, 1GB RAM (Starter/Standard plan) is recommended.

### Issue 2: `DATABASE_URL` format error
- **Cause**: Render supplies PostgreSQL URLs in `postgres://` or `postgresql://` format instead of JDBC `jdbc:postgresql://`.
- **Solution**: The backend includes `DatabaseConfig.java`, which automatically detects Render's URL format, parses credentials, and constructs a secure JDBC connection with SSL (`sslmode=require`).

### Issue 3: Gmail SMTP Authentication Failure (535 5.7.8)
- **Cause**: Plain account password used instead of a Google App Password.
- **Solution**: Go to Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords. Generate an App Password for "Mail" and set `GMAIL_APP_PASSWORD` in Render.

### Issue 4: Dynamic Port Binding
- **Cause**: Render binds services to arbitrary dynamic ports (e.g., 10000).
- **Solution**: The Dockerfile entrypoint passes `-Dserver.port=${PORT:-8080}` and `application.yml` maps `server.port: ${PORT:8080}`. The application dynamically adapts to any port Render assigns.

### Issue 5: CORS Errors from Frontend (e.g. Vercel)
- **Cause**: Frontend origin not in allowed origins list.
- **Solution**: Update the `CORS_ORIGIN` environment variable in Render to include your exact frontend URLs: `https://www.kaizenq.in,https://kaizenq.in,https://your-app.vercel.app`.

