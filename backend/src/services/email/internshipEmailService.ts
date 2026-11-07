import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import logger from '../../config/logger';
import { emailService } from './EmailService';

export interface InternshipApplicationEmailData {
  applicationId: string;
  fullName: string;
  name?: string;
  email: string;
  phone: string;
  college?: string;
  degree?: string;
  branch?: string;
  currentYear?: string;
  graduationYear?: number | string;
  skills?: string;
  position: string;
  department?: string;
  workMode?: string;
  linkedin?: string;
  linkedinUrl?: string;
  github?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  statementOfPurpose?: string;
  appliedAt?: string;
  resumeFileName?: string;
  resumeUrl?: string;
}

export interface ResumeAttachment {
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

export interface InternshipEmailDispatchResult {
  hrEmailSent: boolean;
  applicantEmailSent: boolean;
  hrMessageId?: string;
  applicantMessageId?: string;
  error?: string;
}

/**
 * Builds the professional HTML email sent to HR (kaizenqlms@gmail.com)
 */
export function buildHrNotificationHtml(
  data: InternshipApplicationEmailData,
  resumeInfo?: { filename: string; sizeKb: number }
): string {
  const applicantName = data.fullName || data.name || 'Candidate';
  const appliedDate = data.appliedAt
    ? new Date(data.appliedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

  const linkedinLink = data.linkedin || data.linkedinUrl;
  const githubLink = data.github || data.githubUrl;
  const portfolioLink = data.portfolioUrl;
  const coverLetterText = data.coverLetter || data.statementOfPurpose;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Internship Application</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 680px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
          <!-- Top Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%); padding: 36px 36px 32px 36px; text-align: left; border-bottom: 3px solid #3b82f6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(96, 165, 250, 0.4); color: #93c5fd; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">
                      Shaivika Groups &bull; Talent Acquisition
                    </div>
                    <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      New Internship Candidate Application
                    </h1>
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1; font-weight: 500;">
                      Position: <span style="color: #60a5fa; font-weight: 700;">${data.position}</span>
                    </p>
                  </td>
                  <td align="right" valign="top" style="text-align: right;">
                    <div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 10px 16px; text-align: right; display: inline-block;">
                      <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 700;">Application ID</div>
                      <div style="font-size: 15px; font-family: 'Courier New', monospace; font-weight: 800; color: #38bdf8; margin-top: 2px;">${data.applicationId}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summary Alert Banner -->
          <tr>
            <td style="padding: 24px 36px 0 36px;">
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-left: 5px solid #0284c7; border-radius: 12px; padding: 16px 20px;">
                <div style="font-size: 14px; font-weight: 700; color: #0369a1; margin-bottom: 4px;">
                  Action Required: New Candidate Review
                </div>
                <div style="font-size: 13px; color: #334155; line-height: 1.5;">
                  <strong>${applicantName}</strong> has submitted an application for the <strong>${data.position}</strong> program. The resume file is attached to this email and candidate details are recorded in Google Sheets and Firestore.
                </div>
              </div>
            </td>
          </tr>

          <!-- Candidate Details Table -->
          <tr>
            <td style="padding: 24px 36px;">
              <h2 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                1. Candidate Profile & Contact Information
              </h2>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr style="background: #f8fafc;">
                  <td width="35%" style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Full Legal Name</td>
                  <td width="65%" style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email Address</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #2563eb; border-bottom: 1px solid #e2e8f0;">
                    <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Phone / WhatsApp</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                    <a href="tel:${data.phone}" style="color: #0f172a; text-decoration: none;">${data.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Submission Timestamp</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">${appliedDate}</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b;">Target Department & Work Mode</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #0f172a;">${data.department || 'Engineering'} &bull; ${data.workMode || 'REMOTE'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Academic Background -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <h2 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                2. Academic Background & Technical Skills
              </h2>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr style="background: #f8fafc;">
                  <td width="35%" style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">College / Institute / University</td>
                  <td width="65%" style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.college || 'Not Provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Degree Program & Branch</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.degree || 'B.Tech'} - ${data.branch || 'Not Specified'}</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Year of Study & Graduation Year</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.currentYear || '3rd Year'} (Graduation: ${data.graduationYear || '2026'})</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b;">Technical Skills</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #0284c7;">${data.skills || 'Not specified'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Online Profiles & Resume Attachment -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <h2 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                3. Profiles, Resume & Statement
              </h2>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px;">Profiles & Links:</div>
                <div style="font-size: 13px; line-height: 1.8;">
                  ${linkedinLink ? `<div><strong>LinkedIn:</strong> <a href="${linkedinLink}" style="color: #0284c7; text-decoration: underline;" target="_blank">${linkedinLink}</a></div>` : ''}
                  ${githubLink ? `<div><strong>GitHub:</strong> <a href="${githubLink}" style="color: #0284c7; text-decoration: underline;" target="_blank">${githubLink}</a></div>` : ''}
                  ${portfolioLink ? `<div><strong>Portfolio:</strong> <a href="${portfolioLink}" style="color: #0284c7; text-decoration: underline;" target="_blank">${portfolioLink}</a></div>` : ''}
                  ${!linkedinLink && !githubLink && !portfolioLink ? '<div style="color: #94a3b8; font-style: italic;">No external profile links provided</div>' : ''}
                </div>
              </div>

              <!-- Resume Attachment Box -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #166534;">
                    &check; Attached Resume Document
                  </div>
                  <div style="font-size: 14px; font-weight: 700; color: #14532d; margin-top: 4px;">
                    ${resumeInfo ? `${resumeInfo.filename} (${resumeInfo.sizeKb} KB)` : data.resumeFileName || 'Resume Attached to this Email'}
                  </div>
                  <div style="font-size: 12px; color: #15803d; margin-top: 2px;">
                    The applicant's complete resume file is attached directly to this email message.
                  </div>
                </div>
              </div>

              ${coverLetterText ? `
              <div style="margin-top: 16px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
                <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px;">Cover Letter / Statement of Purpose:</div>
                <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${coverLetterText}</p>
              </div>` : ''}
            </td>
          </tr>

          <!-- Admin Portal Link Footer -->
          <tr>
            <td style="padding: 0 36px 36px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #0f172a; border-radius: 12px; padding: 20px; text-align: center;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #cbd5e1;">
                      Access candidate pipeline, schedule technical interviews, or update status:
                    </p>
                    <a href="https://www.kaizenq.in/admin/internships" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
                      Open Candidate in Admin Studio &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- System Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #475569;">
                KaizenQ AI LMS Recruitment Automation &bull; Shaivika Groups
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Delivered automatically to HR at <strong style="color: #64748b;">kaizenqlms@gmail.com</strong> upon candidate submission.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds the professional acknowledgement HTML email sent to the applicant
 */
export function buildApplicantConfirmationHtml(data: InternshipApplicationEmailData): string {
  const applicantName = data.fullName || data.name || 'Candidate';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - KaizenQ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%); padding: 36px 32px; text-align: left; color: #ffffff;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(255, 255, 255, 0.2); font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">
                Application Received &bull; KaizenQ Careers
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">
                We Have Received Your Application!
              </h1>
              <p style="margin: 0; font-size: 14px; color: #e0e7ff; line-height: 1.5;">
                Thank you for applying to the <strong>${data.position}</strong> program.
              </p>
            </td>
          </tr>

          <!-- Application ID Highlight -->
          <tr>
            <td style="padding: 28px 32px 0 32px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; text-align: center;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">
                  Your Official Application Reference ID
                </div>
                <div style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: 900; color: #0284c7; letter-spacing: 0.05em; margin: 8px 0;">
                  ${data.applicationId}
                </div>
                <div style="font-size: 12px; color: #94a3b8;">
                  Please keep this reference ID handy for all future recruitment updates.
                </div>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 24px 32px; font-size: 14px; color: #334155; line-height: 1.6;">
              <p style="margin: 0 0 16px 0;">
                Dear <strong>${applicantName}</strong>,
              </p>
              <p style="margin: 0 0 16px 0;">
                We are excited to confirm that your application and resume for the <strong>${data.position}</strong> opportunity at <strong>KaizenQ</strong> (a Shaivika Groups initiative) have been successfully registered in our recruitment system.
              </p>

              <!-- Application Details Box -->
              <div style="background: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; font-size: 13px;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">
                  Submitted Application Summary
                </div>
                <div style="display: grid; grid-gap: 6px;">
                  <div><strong>Position:</strong> ${data.position}</div>
                  <div><strong>College:</strong> ${data.college || 'Provided on record'}</div>
                  <div><strong>Year of Study:</strong> ${data.currentYear || 'Undergraduate'} (Graduation: ${data.graduationYear || '2026'})</div>
                  <div><strong>Technical Skills:</strong> ${data.skills || 'Included with resume'}</div>
                  <div><strong>Resume File:</strong> ${data.resumeFileName || 'Uploaded successfully'}</div>
                </div>
              </div>

              <!-- Next Steps -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
                What to Expect Next in the Selection Process:
              </h3>
              <ol style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                <li style="margin-bottom: 6px;"><strong>Resume & Profile Screening:</strong> Our technical recruiting team will review your credentials and projects within <strong>3-5 business days</strong>.</li>
                <li style="margin-bottom: 6px;"><strong>Technical Assessment / Challenge:</strong> Shortlisted candidates receive an invitation to an assessment or domain coding challenge.</li>
                <li style="margin-bottom: 6px;"><strong>Virtual Interview:</strong> A 30-minute system design or problem-solving discussion with our engineering mentors.</li>
                <li><strong>Final Onboarding:</strong> Verified acceptance letter, mentor assignment, and project kick-off!</li>
              </ol>

              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #1e40af;">
                <strong>Questions or Portfolio Updates?</strong> Reply directly to this email or reach our recruitment team at <a href="mailto:kaizenqlms@gmail.com" style="color: #1e40af; font-weight: 700; text-decoration: underline;">kaizenqlms@gmail.com</a> quoting your Application ID (<strong>${data.applicationId}</strong>).
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px;">
              <div style="font-weight: 800; color: #ffffff; margin-bottom: 4px;">KaizenQ Careers &bull; Shaivika Groups</div>
              <div>Empowering the next generation of engineers, researchers, and creators.</div>
              <div style="margin-top: 12px; font-size: 11px; color: #64748b;">
                &copy; ${new Date().getFullYear()} KaizenQ. All rights reserved. &bull; <a href="https://www.kaizenq.in" style="color: #60a5fa; text-decoration: none;">www.kaizenq.in</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Creates a Nodemailer transporter using configured SMTP environment variables
 */
function createSmtpTransporter(): nodemailer.Transporter | null {
  const host = (process.env.SMTP_HOST || env.SMTP_HOST || '').trim();
  const rawPort = process.env.SMTP_PORT || env.SMTP_PORT || '587';
  const port = parseInt(rawPort, 10) || 587;
  const user = (process.env.SMTP_USER || env.SMTP_USER || '').trim();
  const pass = (
    process.env.SMTP_PASS ||
    env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    env.SMTP_PASSWORD ||
    ''
  ).trim();

  if (!user || !pass) {
    logger.info('[INTERNSHIP_EMAIL] No direct SMTP_USER/SMTP_PASS found; fallback to Brevo/configured emailService.');
    return null;
  }

  const isGmail = host.includes('gmail') || user.includes('@gmail.com');
  if (isGmail) {
    logger.info(`[INTERNSHIP_EMAIL] Creating Nodemailer Gmail transporter for user: ${user}`);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  logger.info(`[INTERNSHIP_EMAIL] Creating Nodemailer SMTP transporter for host: ${host}:${port}`);
  return nodemailer.createTransport({
    host: host || 'smtp-relay.brevo.com',
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
  });
}

/**
 * Primary Email Dispatch Function for Internship Applications
 * Delivers full application details & actual resume file to kaizenqlms@gmail.com
 * and sends an acknowledgement email to the candidate.
 */
export async function sendInternshipApplicationEmails(
  data: InternshipApplicationEmailData,
  resumeAttachment?: ResumeAttachment | null
): Promise<InternshipEmailDispatchResult> {
  const hrTargetEmail = (
    process.env.HR_NOTIFICATION_EMAIL ||
    (env as any).HR_NOTIFICATION_EMAIL ||
    'kaizenqlms@gmail.com'
  ).trim();

  const applicantTargetEmail = (data.email || '').trim().toLowerCase();
  const applicantName = data.fullName || data.name || 'Candidate';

  const hrSubject = `New Internship Application – [${data.position}] – [${applicantName}]`;
  const applicantSubject = `Application Received – [${data.position}] | KaizenQ`;

  const resumeInfo = resumeAttachment
    ? {
        filename: resumeAttachment.filename,
        sizeKb: Math.round(resumeAttachment.buffer.length / 1024),
      }
    : undefined;

  const hrHtml = buildHrNotificationHtml(data, resumeInfo);
  const applicantHtml = buildApplicantConfirmationHtml(data);

  const senderEmail = process.env.SMTP_FROM_EMAIL || env.SMTP_FROM_EMAIL || 'no-reply@kaizenq.in';
  const senderName = process.env.SMTP_FROM_NAME || env.SMTP_FROM_NAME || 'KaizenQ Careers';
  const fromHeader = `"${senderName}" <${senderEmail}>`;

  let hrEmailSent = false;
  let applicantEmailSent = false;
  let hrMessageId: string | undefined;
  let applicantMessageId: string | undefined;
  let lastError: string | undefined;

  // Prepare attachments for Nodemailer & Brevo
  const nodemailerAttachments = resumeAttachment
    ? [
        {
          filename: resumeAttachment.filename,
          content: resumeAttachment.buffer,
          contentType: resumeAttachment.mimetype,
        },
      ]
    : [];

  // ============================================================================
  // STRATEGY 1: Nodemailer Transporter (Gmail SMTP or configured SMTP credentials)
  // ============================================================================
  const smtpTransporter = createSmtpTransporter();

  if (smtpTransporter) {
    try {
      logger.info(`[INTERNSHIP_EMAIL] Dispatching HR notification to ${hrTargetEmail} via Nodemailer...`);
      const hrInfo = await smtpTransporter.sendMail({
        from: fromHeader,
        to: hrTargetEmail,
        replyTo: applicantTargetEmail,
        subject: hrSubject,
        html: hrHtml,
        attachments: nodemailerAttachments,
      });

      hrEmailSent = true;
      hrMessageId = hrInfo.messageId;
      logger.info(`[INTERNSHIP_EMAIL] ✅ HR Notification delivered! ID: ${hrInfo.messageId}`);
    } catch (hrErr: any) {
      lastError = hrErr?.message || String(hrErr);
      logger.warn('[INTERNSHIP_EMAIL] Nodemailer HR notification warning, attempting fallback:', hrErr?.message);
    }

    try {
      logger.info(`[INTERNSHIP_EMAIL] Dispatching applicant confirmation to ${applicantTargetEmail} via Nodemailer...`);
      const appInfo = await smtpTransporter.sendMail({
        from: fromHeader,
        to: applicantTargetEmail,
        replyTo: hrTargetEmail,
        subject: applicantSubject,
        html: applicantHtml,
      });

      applicantEmailSent = true;
      applicantMessageId = appInfo.messageId;
      logger.info(`[INTERNSHIP_EMAIL] ✅ Applicant confirmation delivered! ID: ${appInfo.messageId}`);
    } catch (appErr: any) {
      logger.warn('[INTERNSHIP_EMAIL] Nodemailer applicant confirmation warning:', appErr?.message);
    }
  }

  // ============================================================================
  // STRATEGY 2: Fallback to Brevo HTTP API (Resilient HTTPS API with Base64 attachments)
  // ============================================================================
  if (!hrEmailSent) {
    try {
      logger.info(`[INTERNSHIP_EMAIL] Dispatching HR notification to ${hrTargetEmail} via Brevo HTTP API...`);
      const brevoHrRes = await emailService.sendEmail({
        to: hrTargetEmail,
        subject: hrSubject,
        html: hrHtml,
        attachments: nodemailerAttachments,
      });

      if (brevoHrRes.success) {
        hrEmailSent = true;
        hrMessageId = brevoHrRes.messageId;
        logger.info(`[INTERNSHIP_EMAIL] ✅ HR Notification delivered via Brevo HTTP! ID: ${brevoHrRes.messageId}`);
      } else {
        lastError = brevoHrRes.error;
      }
    } catch (brevoErr: any) {
      lastError = brevoErr?.message || String(brevoErr);
      logger.error('[INTERNSHIP_EMAIL] Brevo HTTP HR dispatch error:', brevoErr);
    }
  }

  if (!applicantEmailSent && applicantTargetEmail) {
    try {
      logger.info(`[INTERNSHIP_EMAIL] Dispatching applicant confirmation to ${applicantTargetEmail} via Brevo HTTP API...`);
      const brevoAppRes = await emailService.sendEmail({
        to: applicantTargetEmail,
        subject: applicantSubject,
        html: applicantHtml,
      });

      if (brevoAppRes.success) {
        applicantEmailSent = true;
        applicantMessageId = brevoAppRes.messageId;
        logger.info(`[INTERNSHIP_EMAIL] ✅ Applicant confirmation delivered via Brevo HTTP! ID: ${brevoAppRes.messageId}`);
      }
    } catch (brevoErr: any) {
      logger.warn('[INTERNSHIP_EMAIL] Brevo HTTP applicant dispatch warning:', brevoErr);
    }
  }

  return {
    hrEmailSent,
    applicantEmailSent,
    hrMessageId,
    applicantMessageId,
    error: hrEmailSent ? undefined : lastError,
  };
}

