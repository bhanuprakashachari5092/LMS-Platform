import PDFDocument from 'pdfkit';
import logger from '../../config/logger';
import { googleSlidesService } from './GoogleSlidesService';

export interface CertificateData {
  certificateId: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  instructorName?: string;
  completionDate: string;
  courseDuration?: string;
  modulesCount?: number;
  qrCodeBuffer: Buffer;
}

export class PDFCertificateGenerator {
  /**
   * Generates a high-quality PDF Certificate using the Google Slides presentation template
   */
  public async generateCertificateBuffer(data: CertificateData): Promise<Buffer> {
    try {
      return await googleSlidesService.generateCertificateFromTemplate(data);
    } catch (err: any) {
      logger.warn(`[PDF GENERATOR] Template export notice (${err?.message || err}). Falling back to vector layout.`);
      return this.generateVectorFallback(data);
    }
  }

  public async generateVectorFallback(data: CertificateData): Promise<Buffer> {
    const rawUid = data.studentId || 'default_student';
    let displayStudentId = rawUid;
    if (!rawUid.includes('@')) {
      displayStudentId = rawUid.startsWith('STU-') ? rawUid : `STU-${rawUid.substring(0, 6).toUpperCase()}`;
    }

    return new Promise((resolve, reject) => {
      try {
        // Landscape A4 Page Dimensions in PDF points: 841.89 x 595.28
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 0,
          info: {
            Title: `Certificate of Completion - ${data.courseTitle}`,
            Author: 'KaizenQ AI LMS',
            Subject: `Official Credential for ${data.studentName}`,
            Keywords: `KaizenQ, LMS, Certificate, ${data.certificateId}`,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          logger.info(`[PDF GENERATOR] ✅ Generated Certificate PDF Buffer (${pdfBuffer.length} bytes) for ${data.studentName}`);
          resolve(pdfBuffer);
        });
        doc.on('error', (err) => {
          logger.error(`[PDF GENERATOR] ❌ Error generating PDF: ${err.message}`);
          reject(err);
        });

        const width = 841.89;
        const height = 595.28;

        // Background
        doc.rect(0, 0, width, height).fill('#ffffff');

        // Top Left corner - Curved Blue Swirl
        doc.save()
          .moveTo(0, 0)
          .lineTo(150, 0)
          .bezierCurveTo(95, 45, 45, 95, 0, 150)
          .closePath()
          .fill('#0a2540');

        // Top Left corner - Curved Gold Wave Border
        doc.save()
          .moveTo(0, 0)
          .lineTo(160, 0)
          .bezierCurveTo(105, 52, 52, 105, 0, 160)
          .closePath()
          .lineWidth(2)
          .stroke('#d4af37');

        // Bottom Right corner - Curved Blue Swirl
        doc.save()
          .moveTo(width, height)
          .lineTo(width - 150, height)
          .bezierCurveTo(width - 95, height - 45, width - 45, height - 95, width, height - 150)
          .closePath()
          .fill('#0a2540');

        // Bottom Right corner - Curved Gold Wave Border
        doc.save()
          .moveTo(width, height)
          .lineTo(width - 160, height)
          .bezierCurveTo(width - 105, height - 52, width - 52, height - 105, width, height - 160)
          .closePath()
          .lineWidth(2)
          .stroke('#d4af37');

        // Double Gold & Slate Borders
        doc
          .rect(18, 18, width - 36, height - 36)
          .lineWidth(1.75)
          .stroke('#d4af37');

        doc
          .rect(23, 23, width - 46, height - 46)
          .lineWidth(0.75)
          .stroke('#cbd5e1');

        // Top Left Gold Seal Badge Ribbon tails
        doc.save()
          .moveTo(38, 50)
          .lineTo(38, 92)
          .lineTo(45, 85)
          .lineTo(52, 92)
          .lineTo(52, 50)
          .closePath()
          .fill('#c59b27');
        doc.save()
          .moveTo(47, 50)
          .lineTo(47, 92)
          .lineTo(54, 85)
          .lineTo(61, 92)
          .lineTo(61, 50)
          .closePath()
          .fill('#d4af37');

        // Top Left Gold Seal Badge Circles
        doc.save()
          .circle(48, 48, 26)
          .fill('#d4af37');
        doc
          .circle(48, 48, 23)
          .fill('#0a2540');
        doc
          .circle(48, 48, 21)
          .lineWidth(1)
          .stroke('#ffffff');

        // Gold Seal Badge Text
        doc
          .fillColor('#d4af37')
          .fontSize(4.5)
          .font('Helvetica-Bold')
          .text('KAIZEN Q', 22, 38, { width: 52, align: 'center' })
          .text('AI-POWERED', 22, 45, { width: 52, align: 'center' })
          .text('LMS', 22, 52, { width: 52, align: 'center' });

        // Kaizen Q Logo (Top Center) - Circle Q
        doc.save()
          .circle(width / 2 - 62, 42, 11)
          .lineWidth(2.5)
          .stroke('#0066cc');
        doc.save()
          .moveTo(width / 2 - 66, 46)
          .lineTo(width / 2 - 58, 38)
          .lineWidth(2)
          .stroke('#0066cc');
        doc.save()
          .moveTo(width / 2 - 61, 38)
          .lineTo(width / 2 - 58, 38)
          .lineTo(width / 2 - 58, 41)
          .lineWidth(2)
          .stroke('#0066cc');

        // Branding Text
        doc
          .fillColor('#0a2540')
          .fontSize(19)
          .font('Helvetica-Bold')
          .text('Kaizen Q', width / 2 - 44, 31);

        doc
          .fillColor('#0066cc')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('AI-POWERED LMS', width / 2 - 44, 51);

        // Certificate ID (Top Right)
        doc
          .fillColor('#64748b')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('CERTIFICATE ID', width - 190, 31, { width: 130, align: 'right' });
        doc
          .fillColor('#0044cc')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(data.certificateId, width - 190, 41, { width: 130, align: 'right' });

        // Certificate Main Title
        doc
          .fillColor('#0a2540')
          .fontSize(30)
          .font('Helvetica-Bold')
          .text('CERTIFICATE', 0, 72, { width, align: 'center' });

        doc
          .fillColor('#c59b27')
          .fontSize(10.5)
          .font('Helvetica-Bold')
          .text('O F   C O M P L E T I O N', 0, 104, { width, align: 'center' });

        // Title Gold Accent Divider
        doc
          .moveTo(width / 2 - 60, 120)
          .lineTo(width / 2 + 60, 120)
          .lineWidth(1.25)
          .stroke('#d4af37');

        // Subtitle
        doc
          .fillColor('#475569')
          .fontSize(9.5)
          .font('Helvetica')
          .text('This is to certify that', 0, 133, { width, align: 'center' });

        // Student Name
        doc
          .fillColor('#0a2540')
          .fontSize(25)
          .font('Times-Bold')
          .text(data.studentName, 0, 149, { width, align: 'center' });

        // Student Name Underline Accent
        doc
          .moveTo(width / 2 - 120, 178)
          .lineTo(width / 2 + 120, 178)
          .lineWidth(0.75)
          .stroke('#e2e8f0');
        doc
          .moveTo(width / 2 - 60, 180)
          .lineTo(width / 2 + 60, 180)
          .lineWidth(1.25)
          .stroke('#d4af37');

        // Course completion text
        doc
          .fillColor('#475569')
          .fontSize(9.5)
          .font('Helvetica')
          .text('has successfully completed the course', 0, 192, { width, align: 'center' });

        // Course Title
        doc
          .fillColor('#0033aa')
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(data.courseTitle, 60, 208, { width: width - 120, align: 'center' });

        // Academy attribution
        doc
          .fillColor('#1e293b')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text('offered by Kaizen Q – AI-Powered LMS.', 0, 230, { width, align: 'center' });

        // Description Paragraph
        doc
          .fillColor('#64748b')
          .fontSize(8.5)
          .font('Helvetica')
          .text(
            'The student has demonstrated outstanding dedication, completed all modules, passed all assessments, and has acquired strong knowledge and skills in the subject.',
            130,
            246,
            { width: width - 260, align: 'center', lineGap: 2 }
          );

        // QR Code Box (Middle Right)
        const qrBoxX = width - 160;
        const qrBoxY = 130;

        doc
          .rect(qrBoxX, qrBoxY, 105, 120)
          .lineWidth(1.25)
          .stroke('#d4af37');

        doc
          .fillColor('#0a2540')
          .fontSize(6.5)
          .font('Helvetica-Bold')
          .text('SCAN TO VERIFY', qrBoxX, qrBoxY + 8, { width: 105, align: 'center' });

        // Embed QR Code PNG Buffer
        try {
          doc.image(data.qrCodeBuffer, qrBoxX + 16.5, qrBoxY + 20, { width: 72, height: 72 });
        } catch (imgErr: any) {
          logger.warn(`[PDF GENERATOR] Failed to embed QR code image: ${imgErr?.message}`);
        }

        doc
          .fillColor('#64748b')
          .fontSize(5.5)
          .font('Helvetica')
          .text('Verify authenticity of this certificate via QR code.', qrBoxX + 4, qrBoxY + 97, { width: 97, align: 'center' });

        // 4 Metric Pillars
        const pillarY = 298;
        const pillarWidth = 130;
        const startX = (width - pillarWidth * 4) / 2;

        const pillars = [
          { label: 'COURSE DURATION', val: data.courseDuration || '24 Hours', icon: 'clock' },
          { label: 'MODULES COMPLETED', val: `${data.modulesCount || 8} / ${data.modulesCount || 8} Modules`, icon: 'book' },
          { label: 'ACHIEVEMENT', val: '100% Score • Mastery', icon: 'trophy' },
          { label: 'COMPLETED ON', val: data.completionDate, icon: 'calendar' },
        ];

        pillars.forEach((p, idx) => {
          const pX = startX + idx * pillarWidth;

          // Render Vector Icon
          doc.save();
          if (p.icon === 'clock') {
            doc.circle(pX + 65, pillarY + 8, 5.5).lineWidth(0.85).stroke('#0033aa');
            doc.moveTo(pX + 65, pillarY + 8).lineTo(pX + 65, pillarY + 4.5).lineTo(pX + 67.5, pillarY + 8).lineWidth(0.85).stroke('#0033aa');
          } else if (p.icon === 'book') {
            doc.moveTo(pX + 58, pillarY + 5.5)
              .quadraticCurveTo(pX + 61.5, pillarY + 3.5, pX + 65, pillarY + 5.5)
              .quadraticCurveTo(pX + 68.5, pillarY + 3.5, pX + 72, pillarY + 5.5)
              .lineTo(pX + 72, pillarY + 11)
              .quadraticCurveTo(pX + 68.5, pillarY + 9, pX + 65, pillarY + 11)
              .quadraticCurveTo(pX + 58, pillarY + 9, pX + 58, pillarY + 11)
              .closePath().lineWidth(0.85).stroke('#0033aa');
          } else if (p.icon === 'trophy') {
            doc.moveTo(pX + 60, pillarY + 4).lineTo(pX + 70, pillarY + 4).lineTo(pX + 68, pillarY + 9.5).lineTo(pX + 62, pillarY + 9.5).closePath();
            doc.moveTo(pX + 65, pillarY + 9.5).lineTo(pX + 65, pillarY + 12);
            doc.moveTo(pX + 62, pillarY + 12).lineTo(pX + 68, pillarY + 12);
            doc.lineWidth(0.85).stroke('#0033aa');
          } else if (p.icon === 'calendar') {
            doc.rect(pX + 59.5, pillarY + 4, 11, 9).lineWidth(0.85).stroke('#0033aa');
            doc.moveTo(pX + 59.5, pillarY + 6.5).lineTo(pX + 70.5, pillarY + 6.5).stroke('#0033aa');
          }
          doc.restore();

          doc
            .fillColor('#64748b')
            .fontSize(6.5)
            .font('Helvetica-Bold')
            .text(p.label, pX, pillarY + 18, { width: pillarWidth, align: 'center' });

          doc
            .fillColor('#0a2540')
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text(p.val, pX, pillarY + 28, { width: pillarWidth, align: 'center' });

          if (idx < 3) {
            doc
              .moveTo(pX + pillarWidth, pillarY + 8)
              .lineTo(pX + pillarWidth, pillarY + 34)
              .lineWidth(0.5)
              .stroke('#cbd5e1');
          }
        });

        // Horizontal Footer Separator
        doc
          .moveTo(80, 355)
          .lineTo(width - 80, 355)
          .lineWidth(0.5)
          .stroke('#e2e8f0');

        // Signatures Row
        const sigY = 372;

        // Left Signature
        doc
          .fillColor('#64748b')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('CERTIFIED BY', 80, sigY, { width: 160, align: 'center' });
        doc
          .moveTo(80, sigY + 14)
          .lineTo(240, sigY + 14)
          .lineWidth(0.5)
          .stroke('#94a3b8');
        doc
          .fillColor('#0a2540')
          .fontSize(9)
          .font('Times-Bold')
          .text('SHAIVIKA GROUPS', 80, sigY + 18, { width: 160, align: 'center' });

        // Center Company Logo (S logo symbol)
        doc.save()
          .moveTo(width / 2 - 7, sigY - 12)
          .bezierCurveTo(width / 2 - 14, sigY - 8, width / 2 - 14, sigY - 3, width / 2 - 7, sigY)
          .bezierCurveTo(width / 2, sigY + 3, width / 2, sigY + 8, width / 2 - 7, sigY + 12)
          .lineWidth(2.5)
          .stroke('#0066cc');

        doc
          .fillColor('#0a2540')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('SHAIVIKA GROUP', 0, sigY + 4, { width, align: 'center' });
        doc
          .fillColor('#b8860b')
          .fontSize(5.5)
          .font('Helvetica-Bold')
          .text('LEARN  •  GROW  •  SUCCEED', 0, sigY + 16, { width, align: 'center' });

        // Right Signature
        doc
          .fillColor('#64748b')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('FOUNDER & CEO', width - 240, sigY, { width: 160, align: 'center' });
        doc
          .moveTo(width - 240, sigY + 14)
          .lineTo(width - 80, sigY + 14)
          .lineWidth(0.5)
          .stroke('#94a3b8');
        doc
          .fillColor('#0a2540')
          .fontSize(9)
          .font('Times-Bold')
          .text('SHAIVIKA GROUPS', width - 240, sigY + 18, { width: 160, align: 'center' });

        doc.end();
      } catch (err: any) {
        logger.error(`[PDF GENERATOR] ❌ Exception in PDF generation: ${err?.message || err}`);
        reject(err);
      }
    });
  }
}

export const pdfCertificateGenerator = new PDFCertificateGenerator();
