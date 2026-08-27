import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import logger from '../../config/logger';
import { qrCodeService } from './QRCodeService';

export interface CertificateData {
  certificateId: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  instructorName?: string;
  completionDate: string;
  courseDuration?: string;
  modulesCount?: number | string;
  achievement?: string;
  qrCodeBuffer?: Buffer;
}

/**
 * Robust date formatter to standard "DD Month YYYY" (e.g. 27 August 2026)
 */
export const formatCompletionDate = (rawDate?: string | Date): string => {
  if (!rawDate) {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  if (typeof rawDate === 'string' && /^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(rawDate.trim())) {
    return rawDate.trim();
  }

  try {
    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) {
      return String(rawDate).trim();
    }
    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(rawDate).trim();
  }
};

export class PDFCertificateGenerator {
  /**
   * Resolves the verified production certificate template image asset.
   */
  private resolveTemplatePath(): string {
    const candidatePaths = [
      path.resolve(__dirname, '../../assets/templates/certificate_template.png'),
      path.resolve(process.cwd(), 'src/assets/templates/certificate_template.png'),
      path.resolve(process.cwd(), 'backend/src/assets/templates/certificate_template.png'),
      path.resolve(process.cwd(), 'dist/assets/templates/certificate_template.png'),
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return candidatePaths[0];
  }

  /**
   * Validates certificate data before rendering to avoid corrupted or blank values.
   */
  public validateCertificateData(data: CertificateData): void {
    const isInvalid = (val?: string | number) =>
      val === undefined ||
      val === null ||
      String(val).trim() === '' ||
      String(val) === 'undefined' ||
      String(val) === 'null' ||
      String(val) === 'NaN' ||
      String(val) === '[object Object]';

    if (isInvalid(data.studentName)) {
      throw new Error('Validation Error: Valid studentName is required for certificate generation');
    }
    if (isInvalid(data.courseTitle)) {
      throw new Error('Validation Error: Valid courseTitle is required for certificate generation');
    }
    if (isInvalid(data.certificateId)) {
      throw new Error('Validation Error: Valid certificateId is required for certificate generation');
    }
  }

  /**
   * Generates a pristine A4 Landscape PDF certificate buffer with the production template overlay.
   */
  public async generateCertificateBuffer(data: CertificateData): Promise<Buffer> {
    this.validateCertificateData(data);

    // Ensure QR Code buffer is generated if not provided
    let qrBuffer = data.qrCodeBuffer;
    if (!qrBuffer) {
      try {
        qrBuffer = await qrCodeService.generateVerificationQRCodeBuffer(
          data.certificateId,
          data.studentId || 'STUDENT'
        );
      } catch (qrErr: any) {
        logger.warn(`[PDF CERTIFICATE GENERATOR] QR Generation Notice: ${qrErr?.message || qrErr}`);
      }
    }

    return new Promise((resolve, reject) => {
      try {
        // Landscape A4 Page Dimensions in PDF points: 841.89 x 595.28 pt
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 0,
          info: {
            Title: `Certificate of Completion - ${data.courseTitle}`,
            Author: 'Kaizen Q AI-Powered LMS',
            Subject: `Official Certificate for ${data.studentName}`,
            Keywords: `KaizenQ, LMS, Certificate, ${data.certificateId}`,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          logger.info(`[PDF CERTIFICATE GENERATOR] ✅ Generated PDF Buffer (${pdfBuffer.length} bytes) for ${data.studentName}`);
          resolve(pdfBuffer);
        });
        doc.on('error', (err) => {
          logger.error(`[PDF CERTIFICATE GENERATOR] ❌ Error generating PDF: ${err.message}`);
          reject(err);
        });

        // 1. Draw Production Template as Full-Page Background
        const templatePath = this.resolveTemplatePath();
        if (fs.existsSync(templatePath)) {
          doc.image(templatePath, 0, 0, {
            width: 841.89,
            height: 595.28,
          });
        } else {
          logger.warn(`[PDF CERTIFICATE GENERATOR] Template not found at ${templatePath}. Rendering fallback background.`);
          doc.rect(0, 0, 841.89, 595.28).fill('#ffffff');
        }

        // 2. Certificate ID (Top Right)
        doc.font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#0A2540')
          .text(data.certificateId.trim(), 650, 74, {
            width: 120,
            align: 'center',
          });

        // 3. Student Name (Center, Title Case / Calligraphic with Auto-Fitting)
        const cleanStudentName = data.studentName.trim();
        let nameFontSize = 26;
        doc.font('Times-BoldItalic').fontSize(nameFontSize);
        while (doc.widthOfString(cleanStudentName) > 580 && nameFontSize > 16) {
          nameFontSize -= 1;
          doc.fontSize(nameFontSize);
        }
        const yOffsetName = (26 - nameFontSize) * 0.35;
        doc.fillColor('#0A2540')
          .text(cleanStudentName, 100, 244 + yOffsetName, {
            width: 641.89,
            align: 'center',
          });

        // 4. Course Title (Center, Bold Uppercase with Auto-Fitting)
        const cleanCourseTitle = data.courseTitle.trim().toUpperCase();
        let courseFontSize = 15;
        doc.font('Helvetica-Bold').fontSize(courseFontSize);
        while (doc.widthOfString(cleanCourseTitle) > 600 && courseFontSize > 9.5) {
          courseFontSize -= 0.5;
          doc.fontSize(courseFontSize);
        }
        const yOffsetCourse = (15 - courseFontSize) * 0.35;
        doc.fillColor('#0A2540')
          .text(cleanCourseTitle, 100, 322 + yOffsetCourse, {
            width: 641.89,
            align: 'center',
          });

        // 5. Dynamic Metrics Badges (Course Duration, Modules Completed, Achievement, Completed On)
        const durationText = data.courseDuration ? String(data.courseDuration).trim() : '25 Hours';
        const modulesText = data.modulesCount
          ? (typeof data.modulesCount === 'number' ? `${data.modulesCount} Modules` : String(data.modulesCount).trim())
          : 'All Modules';
        const achievementText = data.achievement ? String(data.achievement).trim() : '100% Completed';
        const formattedDate = formatCompletionDate(data.completionDate);

        // Badge 1: Course Duration
        doc.font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor('#0A2540')
          .text(durationText, 140, 472, {
            width: 95,
            align: 'center',
          });

        // Badge 2: Modules Completed
        doc.font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor('#0A2540')
          .text(modulesText, 308, 472, {
            width: 95,
            align: 'center',
          });

        // Badge 3: Achievement
        doc.font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor('#0A2540')
          .text(achievementText, 475, 472, {
            width: 95,
            align: 'center',
          });

        // Badge 4: Completed On
        doc.font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor('#0A2540')
          .text(formattedDate, 635, 472, {
            width: 95,
            align: 'center',
          });

        // 6. QR Code (Framed in Dashed Box on Right)
        if (qrBuffer) {
          doc.image(qrBuffer, 720, 365, {
            width: 58,
            height: 58,
          });
        }

        doc.end();
      } catch (err: any) {
        logger.error(`[PDF CERTIFICATE GENERATOR] ❌ Unexpected Error: ${err?.message || err}`);
        reject(err);
      }
    });
  }
}

export const pdfCertificateGenerator = new PDFCertificateGenerator();
