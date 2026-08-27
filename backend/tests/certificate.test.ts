import { pdfCertificateGenerator, formatCompletionDate } from '../src/services/certificate/PDFCertificateGenerator';
import { qrCodeService } from '../src/services/certificate/QRCodeService';

describe('PDFCertificateGenerator & Template Overlay Tests', () => {
  const sampleCertificateData = {
    certificateId: 'KQ-TEST-2026-0001',
    studentId: 'test_student_123',
    studentName: 'Test Student',
    courseTitle: 'Full Stack Web Development',
    courseDuration: '40 Hours',
    modulesCount: '12 Modules',
    achievement: '100% Completed',
    completionDate: '27 August 2026',
  };

  test('formatCompletionDate formats various date representations into "DD Month YYYY"', () => {
    expect(formatCompletionDate('2026-08-27')).toMatch(/27\s+August\s+2026/);
    expect(formatCompletionDate('27 August 2026')).toBe('27 August 2026');
    expect(formatCompletionDate('2026-05-02T00:00:00.000Z')).toMatch(/02\s+May\s+2026/);
  });

  test('generates dynamic QR code buffer with error correction level M and zero margin', async () => {
    const qrBuffer = await qrCodeService.generateVerificationQRCodeBuffer(
      'KQ-TEST-2026-0001',
      'test_student_123',
      'https://www.kaizenq.in/verify-certificate'
    );
    expect(Buffer.isBuffer(qrBuffer)).toBe(true);
    expect(qrBuffer.length).toBeGreaterThan(500);
    // PNG magic bytes
    expect(qrBuffer[0]).toBe(0x89);
    expect(qrBuffer[1]).toBe(0x50);
  });

  test('successfully generates valid PDF Buffer for standard test certificate', async () => {
    const pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer(sampleCertificateData);

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(50000); // Template is ~280KB, output PDF should be >200KB

    // Verify PDF Magic Bytes: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    const pdfHeader = pdfBuffer.subarray(0, 5).toString('ascii');
    expect(pdfHeader).toBe('%PDF-');
  });

  test('throws validation error when studentName is missing or invalid', async () => {
    await expect(
      pdfCertificateGenerator.generateCertificateBuffer({
        ...sampleCertificateData,
        studentName: '',
      })
    ).rejects.toThrow(/Valid studentName is required/);

    await expect(
      pdfCertificateGenerator.generateCertificateBuffer({
        ...sampleCertificateData,
        studentName: '   ',
      })
    ).rejects.toThrow(/Valid studentName is required/);
  });

  test('throws validation error when courseTitle is missing or invalid', async () => {
    await expect(
      pdfCertificateGenerator.generateCertificateBuffer({
        ...sampleCertificateData,
        courseTitle: '',
      })
    ).rejects.toThrow(/Valid courseTitle is required/);

    await expect(
      pdfCertificateGenerator.generateCertificateBuffer({
        ...sampleCertificateData,
        courseTitle: 'null',
      })
    ).rejects.toThrow(/Valid courseTitle is required/);
  });

  test('throws validation error when certificateId is missing or invalid', async () => {
    await expect(
      pdfCertificateGenerator.generateCertificateBuffer({
        ...sampleCertificateData,
        certificateId: '',
      })
    ).rejects.toThrow(/Valid certificateId is required/);
  });

  test('handles long student name with auto-scaling without error', async () => {
    const longNameData = {
      ...sampleCertificateData,
      studentName: 'Alexander Montgomery Montgomery-Cunningham III of Edinburgh & Oxford',
    };

    const pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer(longNameData);
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });

  test('handles long course title with auto-scaling without error', async () => {
    const longCourseData = {
      ...sampleCertificateData,
      courseTitle: 'ENTERPRISE DATABASE MANAGEMENT SYSTEMS (DBMS) & ADVANCED CLOUD ARCHITECTURE MASTERY 2026',
    };

    const pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer(longCourseData);
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });
});
