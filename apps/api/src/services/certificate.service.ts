import puppeteer from 'puppeteer';
import { prisma } from '../utils/prisma';
import { format } from 'date-fns';
import { resolveLocalized } from '../utils/localized';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.cwayacademy.com';

function generateCertificateNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CA/${yy}${mm}/${randomNum}`;
}

// ─── Shared CSS Styles ────────────────────────────────────────────────────────
const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 297mm; height: 210mm;
    background: #0C1527;
    font-family: 'Inter', sans-serif;
    display: flex; align-items: center; justify-content: center;
  }

  .cert-frame { width: 289mm; height: 202mm; position: relative; overflow: hidden; }
  .border-outer { position: absolute; inset: 0; background: #0C1527; }

  /* Gold corner accents */
  .corner { position: absolute; width: 80px; height: 80px; }
  .corner-tl { top: 8mm; left: 8mm; border-top: 3px solid #C9973A; border-left: 3px solid #C9973A; }
  .corner-tr { top: 8mm; right: 8mm; border-top: 3px solid #C9973A; border-right: 3px solid #C9973A; }
  .corner-bl { bottom: 8mm; left: 8mm; border-bottom: 3px solid #C9973A; border-left: 3px solid #C9973A; }
  .corner-br { bottom: 8mm; right: 8mm; border-bottom: 3px solid #C9973A; border-right: 3px solid #C9973A; }

  .edge-deco { position: absolute; background: #C9973A; }
  .edge-top    { top: 8mm;    left: 90px; right: 90px; height: 1.5px; }
  .edge-bottom { bottom: 8mm; left: 90px; right: 90px; height: 1.5px; }
  .edge-left   { left: 8mm;   top: 90px;  bottom: 90px; width: 1.5px; }
  .edge-right  { right: 8mm;  top: 90px;  bottom: 90px; width: 1.5px; }

  .gold-bar { position: absolute; background: linear-gradient(to right, #C9973A, #E8C57A, #C9973A); }
  .gold-bar-top    { top: 0; left: 0; right: 0; height: 4px; }
  .gold-bar-bottom { bottom: 0; left: 0; right: 0; height: 4px; }

  /* Cream inner content area */
  .cert-inner {
    position: absolute;
    top: 14mm; left: 14mm; right: 14mm; bottom: 14mm;
    background: #FDFAF4;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 22px 44px;
    gap: 0;
  }

  .inner-border {
    position: absolute;
    top: 8px; left: 8px; right: 8px; bottom: 8px;
    border: 1px solid #C9973A;
    pointer-events: none;
    opacity: 0.3;
  }
  .inner-corner { position: absolute; width: 20px; height: 20px; border: 1.5px solid #C9973A; }
  .inner-corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
  .inner-corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
  .inner-corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
  .inner-corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

  /* ── CWAY ACADEMY title matches the uploaded branding image ── */
  .org-title {
    font-family: 'Cinzel', serif;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 2px;
  }
  .org-title .cway   { color: #1A261D; }
  .org-title .academy { color: #C9973A; letter-spacing: 0.18em; font-weight: 400; }

  .org-subtitle {
    font-family: 'Montserrat', sans-serif;
    font-size: 9px; letter-spacing: 0.28em;
    text-transform: uppercase; color: #8A9E8C;
    margin-bottom: 14px;
  }

  /* ── CERTIFICATE / PROGRAM title ── */
  .cert-title {
    font-family: 'Cinzel', serif;
    font-size: 34px; font-weight: 700;
    color: #1A261D;
    letter-spacing: 0.08em;
    margin-bottom: 0px;
  }

  .cert-subtitle {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px; letter-spacing: 0.28em;
    text-transform: uppercase;
    color: #C9973A;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .cert-subtitle::before, .cert-subtitle::after {
    content: ''; width: 55px; height: 1.5px; background: #C9973A;
  }

  .presented-to {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-style: italic;
    color: #666; margin-bottom: 8px;
  }

  .student-name {
    font-family: 'Great Vibes', cursive;
    font-size: 56px; font-weight: 400;
    color: #C9973A; letter-spacing: 0.02em;
    border-bottom: 2px solid #C9973A;
    padding-bottom: 4px; margin-bottom: 16px;
    min-width: 380px; text-align: center;
  }

  .cert-body {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-style: italic;
    color: #444; text-align: center;
    line-height: 1.6; max-width: 560px;
    margin-bottom: 0px;
  }

  .top-section {
    flex-grow: 1; display: flex; flex-direction: column;
    justify-content: center; align-items: center; width: 100%;
  }

  /* ── Bottom Section (pushed to bottom) ── */
  .bottom-section {
    width: 100%;
  }

  /* ── Signatories ── */
  .signatories {
    width: 100%; display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 16px; margin-top: 0px;
  }
  .signatory { text-align: center; min-width: 170px; }
  .sig-line { width: 150px; height: 1px; background: #333; margin: 0 auto 6px; }
  .sig-name {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px; color: #0C1527;
    font-weight: 700; margin-bottom: 2px;
  }
  .sig-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 9px; color: #C9973A; letter-spacing: 0.03em;
  }

  /* ── Seal ── */
  .seal-section {
    text-align: center; display: flex; flex-direction: column;
    align-items: center; margin-top: 14px;
  }
  .seal {
    width: 52px; height: 52px; border-radius: 50%;
    border: 2px solid #0C1527;
    display: flex; align-items: center; justify-content: center;
    background: white; margin-bottom: 8px;
    overflow: hidden;
  }
  .seal img { width: 44px; height: 44px; object-fit: contain; }
  .cert-number {
    font-family: 'Montserrat', sans-serif; font-size: 10px; color: #555;
    letter-spacing: 0.03em; margin-bottom: 2px;
  }
  .reg-info {
    font-family: 'Inter', sans-serif; font-size: 8px; color: #888;
    letter-spacing: 0.02em;
  }
`;

// ─── Shared frame HTML ───────────────────────────────────────────────────────
function frameWrapper(innerContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="cert-frame">
    <div class="border-outer"></div>
    <div class="gold-bar gold-bar-top"></div>
    <div class="gold-bar gold-bar-bottom"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    <div class="edge-deco edge-top"></div>
    <div class="edge-deco edge-bottom"></div>
    <div class="edge-deco edge-left"></div>
    <div class="edge-deco edge-right"></div>

    <div class="cert-inner">
      <div class="inner-border"></div>
      <div class="inner-corner inner-corner-tl"></div>
      <div class="inner-corner inner-corner-tr"></div>
      <div class="inner-corner inner-corner-bl"></div>
      <div class="inner-corner inner-corner-br"></div>

      ${innerContent}
    </div>
  </div>
</body>
</html>`;
}

// ─── Signatories block (shared) ──────────────────────────────────────────────
const SIGNATORIES_HTML = `
      <div class="bottom-section">
        <!-- SIGNATORIES -->
        <div class="signatories">
          <div class="signatory">
            <div class="sig-line"></div>
            <div class="sig-name">Dr. Reeju Tharakan</div>
            <div class="sig-title">Executive Director</div>
          </div>
          <div class="signatory">
            <div class="sig-line"></div>
            <div class="sig-name">Pr. Robin Ninan</div>
            <div class="sig-title">Director of Academics</div>
          </div>
          <div class="signatory">
            <div class="sig-line"></div>
            <div class="sig-name">Evg. Finny Philip Varghese</div>
            <div class="sig-title">Administrative Director</div>
          </div>
        </div>

        <!-- SEAL & CERT NUMBER -->
        <div class="seal-section">
          <div class="seal">
            <img src="{{logoUrl}}" alt="Seal">
          </div>
          <div class="cert-number">Certificate Number: {{certificateNumber}}</div>
          <div class="reg-info">a project under CWAY MISSIONS Regn # HLS-4-00219-2023-24</div>
        </div>
      </div>`;

// ─── Course Certificate Template ─────────────────────────────────────────────
export const COURSE_CERTIFICATE_HTML = frameWrapper(`
      <div class="top-section">
        <!-- HEADER -->
        <div class="org-title"><span class="cway">CWAY</span> <span class="academy">ACADEMY</span></div>
        <div class="org-subtitle">Coach, Challenge, and Commission</div>

        <div class="cert-title">CERTIFICATE</div>
        <div class="cert-subtitle">OF COMPLETION</div>

        <div class="presented-to">presented to:</div>
        <div class="student-name">{{studentName}}</div>

        <div class="cert-body">
          for successfully completing the course titled
          "{{courseName}}," conducted by CWAY Academy.
          Completed on {{completionDate}}.
        </div>
      </div>
${SIGNATORIES_HTML}`);

// ─── Program Certificate Template ────────────────────────────────────────────
export const PROGRAM_CERTIFICATE_HTML = frameWrapper(`
      <div class="top-section">
        <!-- HEADER -->
        <div class="org-title"><span class="cway">CWAY</span> <span class="academy">ACADEMY</span></div>
        <div class="org-subtitle">Coach, Challenge, and Commission</div>

        <div class="cert-title">PROGRAM</div>
        <div class="cert-subtitle">CERTIFICATE OF COMPLETION</div>

        <div class="presented-to">presented to:</div>
        <div class="student-name">{{studentName}}</div>

        <div class="cert-body">
          for fulfilling all the requirements of the program
          titled "{{courseName}}," conducted by CWAY Academy.
          Completed on {{completionDate}}.
        </div>
      </div>
${SIGNATORIES_HTML}`);

// ─────────────────────────────────────────────────────────────────────────────

export class CertificateService {
  public static async generateCertificatePDF(certificateId: string): Promise<Buffer> {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: { select: { name: true } },
        course: {
          select: {
            title: true,
            moduleNumber: true,
            scriptureRef: true,
            programId: true,
            program: { select: { title: true } },
            instructor: { select: { name: true } }
          }
        },
        program: { select: { title: true } },
        template: true
      }
    });

    if (!certificate) throw new Error('Certificate not found');

    // Ensure certificate number is saved
    let certNumber = certificate.certificateNumber;
    if (!certNumber) {
      certNumber = generateCertificateNumber();
      await prisma.certificate.update({
        where: { id: certificateId },
        data: { certificateNumber: certNumber }
      });
    }

    const isProgram = certificate.type === 'PROGRAM';
    const rawTitle = isProgram 
      ? certificate.program?.title || certificate.course?.program?.title
      : certificate.course?.title;
    const displayName = resolveLocalized(rawTitle) || (isProgram ? 'Program' : 'Course');

    // Convert local logo.png to base64 Data URI so Puppeteer renders it 100% reliably in PDF without network dependency
    let logoDataUri = 'https://pub-f282ad46200f49dc90b58a8a4e737923.r2.dev/assets/logo.png';
    try {
      const fs = require('fs');
      const path = require('path');
      const logoPath = path.join(process.cwd(), '../web/public/logo.png');
      if (fs.existsSync(logoPath)) {
        const logoB64 = fs.readFileSync(logoPath).toString('base64');
        logoDataUri = `data:image/png;base64,${logoB64}`;
      }
    } catch (e) {
      console.warn('Failed to load local logo file for PDF, using R2 URL fallback', e);
    }

    const templateData: Record<string, string> = {
      studentName: certificate.student.name,
      courseName: displayName as string,
      moduleNumber: certificate.course?.moduleNumber?.toString() || '',
      scriptureRef: certificate.course?.scriptureRef || '',
      instructorName: certificate.course?.instructor?.name || '',
      completionDate: format(new Date(certificate.issuedAt), 'MMMM d, yyyy'),
      uniqueCode: certificate.uniqueCode,
      certificateNumber: certNumber,
      logoUrl: logoDataUri,
      verifyUrl: `${process.env.APP_URL || 'https://www.cwayacademy.com'}/certificate/${certificate.uniqueCode}`
    };

    // Always use built-in vector-optimized templates for crisp logo & seal rendering
    const htmlTemplate = isProgram ? PROGRAM_CERTIFICATE_HTML : COURSE_CERTIFICATE_HTML;

    let renderedHtml = htmlTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => templateData[key] || '');
    renderedHtml = renderedHtml.replace(/\{\{#if moduleNumber\}\}([\s\S]*?)\{\{\/if\}\}/g, templateData.moduleNumber ? '$1' : '');
    renderedHtml = renderedHtml.replace(/\{\{#if scriptureRef\}\}([\s\S]*?)\{\{\/if\}\}/g, templateData.scriptureRef ? '$1' : '');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ]
    });
    const page = await browser.newPage();
    await page.setContent(renderedHtml, { waitUntil: 'load' });
    await page.emulateMediaType('print');
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    await browser.close();

    return Buffer.from(pdfUint8Array);
  }

  public static async issueCertificate(studentId: string, courseId: string) {
    const existing = await prisma.certificate.findFirst({
      where: { studentId, courseId, type: 'COURSE' }
    });
    if (existing) return existing;

    const template = await prisma.certificateTemplate.findFirst({
      where: { isDefault: true, type: 'COURSE' }
    });

    const certNumber = generateCertificateNumber();

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        courseId,
        type: 'COURSE',
        templateId: template?.id,
        certificateNumber: certNumber
      },
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { title: true } }
      }
    });

    try {
      const { sendCertificateIssuedEmail } = await import('./email.service');
      await sendCertificateIssuedEmail(
        { name: certificate.student.name, email: certificate.student.email },
        { title: resolveLocalized(certificate.course?.title) || 'Course' },
        certificate.uniqueCode
      );
    } catch (e) {
      console.error('[Email] Failed to send certificate issued email:', e);
    }

    return certificate;
  }

  public static async issueProgramCertificate(studentId: string, programId: string) {
    const existing = await prisma.certificate.findFirst({
      where: { studentId, programId, type: 'PROGRAM' }
    });
    if (existing) return existing;

    const template = await prisma.certificateTemplate.findFirst({
      where: { isDefault: true, type: 'PROGRAM' }
    });

    const certNumber = generateCertificateNumber();

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        programId,
        type: 'PROGRAM',
        templateId: template?.id,
        certificateNumber: certNumber
      },
      include: {
        student: { select: { name: true, email: true } },
        program: { select: { title: true } }
      }
    });

    try {
      const { sendCertificateIssuedEmail } = await import('./email.service');
      await sendCertificateIssuedEmail(
        { name: certificate.student.name, email: certificate.student.email },
        { title: resolveLocalized(certificate.program?.title) || 'Program' },
        certificate.uniqueCode
      );
    } catch (e) {
      console.error('[Email] Failed to send certificate issued email:', e);
    }

    return certificate;
  }
}
