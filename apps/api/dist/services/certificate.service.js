"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const prisma_1 = require("../utils/prisma");
const date_fns_1 = require("date-fns");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const DEFAULT_CERTIFICATE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 297mm; height: 210mm;
      background: #F5F0E8;
      font-family: 'Inter', sans-serif;
      display: flex; align-items: center;
      justify-content: center;
    }

    .cert-outer {
      width: 277mm; height: 190mm;
      border: 3px solid #C9973A;
      padding: 4px;
      background: #F5F0E8;
    }

    .cert-inner {
      width: 100%; height: 100%;
      border: 1px solid #C9973A;
      padding: 32px 48px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: space-between;
    }

    .logo { height: 52px; object-fit: contain; }

    .org-name {
      font-family: 'Inter', sans-serif;
      font-size: 10px; letter-spacing: 0.15em;
      text-transform: uppercase; color: #8A9E8C;
      margin-top: 6px;
    }

    .divider {
      width: 200px; height: 1px;
      background: linear-gradient(to right, transparent, #C9973A, transparent);
      margin: 12px 0;
    }

    .cert-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px; font-style: italic;
      color: #1C2B1E; margin-bottom: 4px;
    }

    .cert-body {
      font-family: 'Inter', sans-serif;
      font-size: 13px; color: #8A9E8C;
      text-align: center;
    }

    .student-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 52px; font-weight: 700;
      color: #C9973A; margin: 8px 0;
      letter-spacing: 0.02em;
    }

    .course-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 26px; color: #1C2B1E;
      font-weight: 600;
    }

    .module-badge {
      display: inline-block;
      background: #C9973A; color: #1C2B1E;
      font-family: 'Inter', sans-serif;
      font-size: 10px; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.1em;
      padding: 3px 12px; border-radius: 999px;
      margin-top: 4px;
    }

    .scripture {
      font-family: 'Cormorant Garamond', serif;
      font-size: 14px; font-style: italic;
      color: #A8792A; margin-top: 8px;
    }

    .completion-date {
      font-family: 'Inter', sans-serif;
      font-size: 12px; color: #8A9E8C;
      margin-top: 4px;
    }

    .signatories {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 12px;
    }

    .signatory {
      text-align: center; min-width: 160px;
    }

    .sig-line {
      width: 140px; height: 1px;
      background: #1C2B1E;
      margin: 0 auto 6px;
    }

    .sig-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px; color: #1C2B1E;
      font-weight: 600;
    }

    .sig-title {
      font-family: 'Inter', sans-serif;
      font-size: 10px; color: #8A9E8C;
      letter-spacing: 0.05em;
    }

    .seal {
      width: 64px; height: 64px;
      border-radius: 50%;
      border: 2px solid #C9973A;
      display: flex; align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .seal img { width: 48px; height: 48px; object-fit: contain; }

    .verify-code {
      font-family: 'Inter', monospace;
      font-size: 8px; color: #8A9E8C;
      letter-spacing: 0.05em;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="cert-outer">
    <div class="cert-inner">

      <!-- TOP -->
      <div style="text-align:center">
        <img class="logo" src="{{logoUrl}}" alt="CWAY Academy">
        <div class="org-name">A Ministry of CWAY Missions</div>
      </div>

      <div class="divider"></div>

      <!-- BODY -->
      <div style="text-align:center">
        <div class="cert-title">Certificate of Completion</div>
        <div class="cert-body">This is to certify that</div>
        <div class="student-name">{{studentName}}</div>
        <div class="cert-body">has successfully completed</div>
        <div class="course-name">{{courseName}}</div>
        {{#if moduleNumber}}
        <span class="module-badge">Module {{moduleNumber}}</span>
        {{/if}}
        {{#if scriptureRef}}
        <div class="scripture">"{{scriptureRef}}"</div>
        {{/if}}
        <div class="completion-date">
          Completed on {{completionDate}}
        </div>
      </div>

      <div class="divider"></div>

      <!-- SIGNATORIES -->
      <div class="signatories">
        <div class="signatory">
          <div class="sig-line"></div>
          <div class="sig-name">{{instructorName}}</div>
          <div class="sig-title">Course Instructor</div>
          <div class="sig-title">CWAY Academy</div>
        </div>

        <div style="text-align:center">
          <div class="seal">
            <img src="{{logoUrl}}" alt="Seal">
          </div>
          <div class="verify-code">{{uniqueCode}}</div>
          <div class="verify-code">{{verifyUrl}}</div>
        </div>

        <div class="signatory">
          <div class="sig-line"></div>
          <div class="sig-name">Dr. Reeju Tharakan</div>
          <div class="sig-title">Executive Director</div>
          <div class="sig-title">CWAY Missions</div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>
`;
class CertificateService {
    static async generateCertificatePDF(certificateId) {
        const certificate = await prisma_1.prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                student: { select: { name: true } },
                course: {
                    select: {
                        title: true,
                        moduleNumber: true,
                        scriptureRef: true,
                        instructor: { select: { name: true } }
                    }
                },
                template: true
            }
        });
        if (!certificate) {
            throw new Error("Certificate not found");
        }
        const templateData = {
            studentName: certificate.student.name,
            courseName: certificate.course.title,
            moduleNumber: certificate.course.moduleNumber ? certificate.course.moduleNumber.toString() : '',
            scriptureRef: certificate.course.scriptureRef || '',
            instructorName: certificate.course.instructor.name,
            completionDate: (0, date_fns_1.format)(new Date(certificate.issuedAt), 'MMMM d, yyyy'),
            uniqueCode: certificate.uniqueCode,
            issuedBy: "CWAY Academy — A Ministry of CWAY Missions",
            logoUrl: process.env.CWAY_LOGO_URL || "https://cwayacademy.netlify.app/logo.png?v=3",
            verifyUrl: `${APP_URL}/certificate/${certificate.uniqueCode}`
        };
        let htmlTemplate = certificate.template?.htmlTemplate || DEFAULT_CERTIFICATE_HTML;
        // Very simple handlebars-like replacement
        let renderedHtml = htmlTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => templateData[key] || '');
        // Handle conditional blocks very simply
        renderedHtml = renderedHtml.replace(/\{\{#if moduleNumber\}\}([\s\S]*?)\{\{\/if\}\}/g, templateData.moduleNumber ? '$1' : '');
        renderedHtml = renderedHtml.replace(/\{\{#if scriptureRef\}\}([\s\S]*?)\{\{\/if\}\}/g, templateData.scriptureRef ? '$1' : '');
        const browser = await puppeteer_1.default.launch({
            headless: true, // true is the new default, 'new' is deprecated
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(renderedHtml, {
            waitUntil: 'load'
        });
        // Add print media type emulation
        await page.emulateMediaType('print');
        // Generate PDF as uint8array
        const pdfUint8Array = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });
        await browser.close();
        // Convert Uint8Array to Buffer for Node.js
        return Buffer.from(pdfUint8Array);
    }
    static async issueCertificate(studentId, courseId) {
        // Check if certificate already exists
        const existing = await prisma_1.prisma.certificate.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId
                }
            }
        });
        if (existing) {
            return existing;
        }
        const template = await prisma_1.prisma.certificateTemplate.findFirst({
            where: { isDefault: true }
        });
        // We'll generate a random unique code if cuid() isn't enough, but cuid is fine
        const certificate = await prisma_1.prisma.certificate.create({
            data: {
                studentId,
                courseId,
                templateId: template?.id,
                // The prisma schema doesn't have uniqueCode in Certificate model?
                // Wait, let's check schema.prisma
            }
        });
        return certificate;
    }
}
exports.CertificateService = CertificateService;
