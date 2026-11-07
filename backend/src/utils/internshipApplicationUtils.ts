import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { Readable } from 'stream';

export interface ParsedResumeFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ParsedApplicationRequest {
  fields: Record<string, string>;
  file?: ParsedResumeFile;
}

/**
 * Validates the uploaded resume file buffer against size, extension, MIME type, and magic bytes.
 */
export function validateResumeFile(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string
): { valid: boolean; error?: string; extension: string; detectedMime: string } {
  // 1. File size check (max 5 MB, min 100 bytes)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (!fileBuffer || fileBuffer.length === 0) {
    return { valid: false, error: 'Resume file is empty or missing.', extension: '', detectedMime: '' };
  }
  if (fileBuffer.length > MAX_SIZE) {
    return { valid: false, error: 'Resume file exceeds the 5MB size limit. Please upload a smaller file.', extension: '', detectedMime: '' };
  }
  if (fileBuffer.length < 100) {
    return { valid: false, error: 'The uploaded file is too small to be a valid resume document.', extension: '', detectedMime: '' };
  }

  // 2. Extension check
  const ext = path.extname(filename || '').toLowerCase().replace('.', '');
  if (!['pdf', 'docx', 'doc'].includes(ext)) {
    return {
      valid: false,
      error: 'Only PDF (.pdf), Word (.docx), and Legacy Word (.doc) resume formats are supported.',
      extension: ext,
      detectedMime: mimetype,
    };
  }

  // 3. MIME type check
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/octet-stream',
  ];
  if (mimetype && !allowedMimes.includes(mimetype.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported MIME type (${mimetype}). Please upload a valid PDF or DOCX file.`,
      extension: ext,
      detectedMime: mimetype,
    };
  }

  // 4. Magic bytes validation
  // PDF starts with '%PDF' (0x25, 0x50, 0x44, 0x46)
  const isPdf = fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46;
  // DOCX is a ZIP container: starts with 'PK\x03\x04' (0x50, 0x4B, 0x03, 0x04)
  const isDocx = fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04;
  // DOC is an OLE compound document: starts with 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1
  const isDoc = fileBuffer[0] === 0xd0 && fileBuffer[1] === 0xcf && fileBuffer[2] === 0x11 && fileBuffer[3] === 0xe0;

  if (ext === 'pdf' && !isPdf) {
    return {
      valid: false,
      error: 'The uploaded file does not match a valid PDF file signature.',
      extension: ext,
      detectedMime: 'unknown',
    };
  }
  if (ext === 'docx' && !isDocx) {
    return {
      valid: false,
      error: 'The uploaded file does not match a valid Word DOCX file signature.',
      extension: ext,
      detectedMime: 'unknown',
    };
  }
  if (ext === 'doc' && !isDoc && !isDocx) {
    return {
      valid: false,
      error: 'The uploaded file does not match a valid Word DOC file signature.',
      extension: ext,
      detectedMime: 'unknown',
    };
  }

  const detectedMime = isPdf
    ? 'application/pdf'
    : isDocx
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : 'application/msword';

  return { valid: true, extension: ext, detectedMime };
}

/**
 * Universal Request Parser:
 * Seamlessly parses both multipart/form-data (via Node 24 native Web Streams & FormData)
 * and standard application/json requests.
 */
export async function parseApplicationRequest(req: Request): Promise<ParsedApplicationRequest> {
  const contentType = (req.headers['content-type'] || '').toLowerCase();

  // Case 1: multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    try {
      const webStream = (Readable as any).toWeb(req);
      const webResponse = new Response(webStream, {
        headers: {
          'content-type': req.headers['content-type'] || '',
        },
      });

      const formData = await webResponse.formData();
      const fields: Record<string, string> = {};
      let file: ParsedResumeFile | undefined;

      for (const [key, value] of (formData as any).entries()) {
        if (typeof value === 'object' && value !== null && typeof (value as any).arrayBuffer === 'function') {
          // File object
          const webFile = value as any;
          const arrayBuf = await webFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          file = {
            fieldname: key,
            originalname: webFile.name || 'resume.pdf',
            mimetype: webFile.type || 'application/pdf',
            size: buffer.length,
            buffer,
          };
        } else {
          fields[key] = String(value);
        }
      }

      return { fields, file };
    } catch (parseErr: any) {
      console.warn('[MULTIPART_PARSER] Multipart stream parsing error, falling back to req.body:', parseErr?.message);
    }
  }

  // Case 2: application/json or fallback
  const fields: Record<string, string> = {};
  const body = req.body || {};

  for (const [k, v] of Object.entries(body)) {
    if (typeof v === 'string') {
      fields[k] = v;
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      fields[k] = String(v);
    }
  }

  let file: ParsedResumeFile | undefined;

  // Check for base64 resume in JSON payload
  const rawBase64 = body.resumeBase64 || body.resumeFileBase64 || body.resume;
  if (rawBase64 && typeof rawBase64 === 'string' && rawBase64.length > 50) {
    try {
      let base64Data = rawBase64;
      let detectedMime = 'application/pdf';

      if (rawBase64.includes(';base64,')) {
        const parts = rawBase64.split(';base64,');
        detectedMime = parts[0].replace('data:', '');
        base64Data = parts[1];
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const filename = body.resumeFileName || body.fileName || 'candidate_resume.pdf';

      file = {
        fieldname: 'resume',
        originalname: filename,
        mimetype: detectedMime,
        size: buffer.length,
        buffer,
      };
    } catch (b64Err) {
      console.warn('[MULTIPART_PARSER] Base64 decode warning:', b64Err);
    }
  }

  return { fields, file };
}

// In-memory binary cache for resumes to guarantee instant admin preview/download
const RESUME_BUFFER_STORE = new Map<string, { buffer: Buffer; mimetype: string; filename: string }>();

/**
 * Stores resume buffer in memory and optional local directory, returning a direct preview URL
 */
export function storeResumeBuffer(
  applicationId: string,
  buffer: Buffer,
  filename: string,
  mimetype: string
): string {
  RESUME_BUFFER_STORE.set(applicationId, { buffer, mimetype, filename });

  // Also persist to local uploads directory for crash-safety
  try {
    const uploadDir = path.resolve(process.cwd(), 'uploads', 'resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const safeExt = path.extname(filename) || '.pdf';
    const filePath = path.join(uploadDir, `${applicationId}${safeExt}`);
    fs.writeFileSync(filePath, buffer);
  } catch (fsErr) {
    // Non-fatal, memory store is active
    console.warn('[RESUME_STORAGE] Local disk write notice:', fsErr);
  }

  const backendUrl = process.env.BACKEND_URL || 'https://www.kaizenq.in';
  return `${backendUrl.replace(/\/+$/, '')}/api/careers/resumes/${applicationId}`;
}

/**
 * Retrieves resume buffer by applicationId for admin preview & download
 */
export function getResumeBuffer(applicationId: string): { buffer: Buffer; mimetype: string; filename: string } | null {
  if (RESUME_BUFFER_STORE.has(applicationId)) {
    return RESUME_BUFFER_STORE.get(applicationId)!;
  }

  // Attempt local disk lookup
  try {
    const uploadDir = path.resolve(process.cwd(), 'uploads', 'resumes');
    const extensions = ['.pdf', '.docx', '.doc'];
    for (const ext of extensions) {
      const filePath = path.join(uploadDir, `${applicationId}${ext}`);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const mimetype = ext === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const filename = `Candidate_Resume_${applicationId}${ext}`;
        return { buffer, mimetype, filename };
      }
    }
  } catch (err) {
    console.warn('[RESUME_STORAGE] Disk read error:', err);
  }

  return null;
}

