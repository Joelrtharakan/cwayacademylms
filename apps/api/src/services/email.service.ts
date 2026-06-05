import nodemailer from "nodemailer";

interface UserEmailInfo {
  name: string;
  email: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM || "CWAY Academy <noreply@cwayacademy.com>";

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "2525"),
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });

  private static wrapHtml(content: string, previewText?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CWAY Academy</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: #F5F0E8;
            color: #1C2B1E;
            margin: 0;
            padding: 20px 0;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(28, 43, 30, 0.12);
            box-shadow: 0 4px 12px rgba(28, 43, 30, 0.05);
          }
          .header {
            background-color: #1C2B1E;
            padding: 32px;
            text-align: center;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .tagline {
            color: #8A9E8C;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-top: 10px;
            font-weight: 600;
          }
          .body {
            padding: 40px 32px;
            background-color: #FFFFFF;
            line-height: 1.6;
          }
          h1 {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 24px;
            color: #1C2B1E;
            margin-top: 0;
            margin-bottom: 20px;
            font-weight: 600;
          }
          p {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 15px;
            color: #243825;
          }
          .cta-container {
            text-align: center;
            margin: 30px 0;
          }
          .btn-primary {
            display: inline-block;
            background-color: #C9973A;
            color: #1C2B1E;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            text-decoration: none;
            font-size: 13px;
            padding: 12px 28px;
            border-radius: 999px;
            transition: background-color 0.2s ease;
          }
          .scripture-quote {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-style: italic;
            font-size: 17px;
            color: #C9973A;
            border-left: 2px solid #C9973A;
            padding-left: 16px;
            margin: 24px 0;
          }
          .footer {
            background-color: #F5F0E8;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #8A9E8C;
            border-top: 1px solid rgba(28, 43, 30, 0.08);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${APP_URL}/logo.png?v=3" alt="CWAY Academy" class="logo" />
            <div class="tagline">Coach. Challenge. Commission.</div>
          </div>
          <div class="body">
            ${content}
          </div>
          <div class="footer">
            CWAY Academy — A Ministry of CWAY Missions, Bangalore, India
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public static async sendVerificationEmail(user: UserEmailInfo, token: string): Promise<void> {
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
    const htmlContent = this.wrapHtml(`
      <h1>Verify Your CWAY Academy Account</h1>
      <p>Hello ${user.name},</p>
      <p>Thank you for registering at CWAY Academy. Please verify your email address to complete your account setup and access the LMS dashboards.</p>
      <div class="cta-container">
        <a href="${verificationUrl}" class="btn-primary" target="_blank">Verify Email</a>
      </div>
      <p>If the button doesn't work, copy and paste this link in your browser:</p>
      <p style="word-break: break-all; font-size: 13px; color: #8A9E8C;">${verificationUrl}</p>
    `);

    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM,
        to: user.email,
        subject: "Verify your CWAY Academy account",
        html: htmlContent,
      });
      console.log(`✓ Verification email sent successfully to ${user.email}`);
    } catch (err) {
      console.log(`[Email Fallback] To: ${user.email} | Token: ${token} | URL: ${verificationUrl}`);
    }
  }

  public static async sendPasswordResetEmail(user: UserEmailInfo, token: string): Promise<void> {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    const htmlContent = this.wrapHtml(`
      <h1>Reset Your CWAY Academy Password</h1>
      <p>Hello ${user.name},</p>
      <p>You are receiving this email because you requested a password reset for your CWAY Academy account.</p>
      <p>Please click the button below to set a new password. This reset link expires in 1 hour.</p>
      <div class="cta-container">
        <a href="${resetUrl}" class="btn-primary" target="_blank">Reset Password</a>
      </div>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p style="word-break: break-all; font-size: 13px; color: #8A9E8C;">${resetUrl}</p>
    `);

    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM,
        to: user.email,
        subject: "Reset your CWAY Academy password",
        html: htmlContent,
      });
      console.log(`✓ Password reset email sent successfully to ${user.email}`);
    } catch (err) {
      console.log(`[Email Fallback] To: ${user.email} | Token: ${token} | URL: ${resetUrl}`);
    }
  }

  public static async sendWelcomeEmail(user: UserEmailInfo): Promise<void> {
    const loginUrl = `${APP_URL}/login`;
    const htmlContent = this.wrapHtml(`
      <h1>Welcome to CWAY Academy</h1>
      <p>Hello ${user.name},</p>
      <p>We are thrilled to welcome you to CWAY Academy. Our mission is equipping frontline leaders for God's Great Commission through accessible, indigenous, and systematic theological training.</p>
      <div class="scripture-quote">
        "Commit your work to the Lord, and your plans will be established."<br>
        — Proverbs 16:3
      </div>
      <div class="cta-container">
        <a href="${loginUrl}" class="btn-primary" target="_blank">Start Learning</a>
      </div>
      <p>If you have any questions or require support, please contact us at support@cwayacademy.com or via WhatsApp.</p>
    `);

    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM,
        to: user.email,
        subject: "Welcome to CWAY Academy — Coach. Challenge. Commission.",
        html: htmlContent,
      });
      console.log(`✓ Welcome email sent successfully to ${user.email}`);
    } catch (err) {
      console.log(`[Email Fallback] To: ${user.email} | Welcome message printed.`);
    }
  }

  public static async sendInstructorWelcomeEmail(user: UserEmailInfo, password: string): Promise<void> {
    const loginUrl = `${APP_URL}/login`;
    const htmlContent = this.wrapHtml(`
      <h1>Welcome to CWAY Academy Faculty</h1>
      <p>Dear ${user.name},</p>
      <p>An administrator has created an Instructor account for you on CWAY Academy. We are honored to have you join our faculty to help equip frontline leaders.</p>
      
      <div style="background: rgba(201, 151, 58, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(201, 151, 58, 0.3); margin: 24px 0;">
        <p style="margin-bottom: 8px; font-weight: 600; color: #1C2B1E;">Your Login Credentials:</p>
        <p style="margin-bottom: 4px; font-family: monospace; font-size: 15px;"><strong>Email:</strong> ${user.email}</p>
        <p style="margin: 0; font-family: monospace; font-size: 15px;"><strong>Password:</strong> ${password}</p>
      </div>

      <p>Please log in using the credentials above. We highly recommend changing your password from your account settings once you log in.</p>
      
      <div class="cta-container">
        <a href="${loginUrl}" class="btn-primary" target="_blank">Log In to Dashboard</a>
      </div>
    `);

    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM,
        to: user.email,
        subject: "Your CWAY Academy Instructor Account Credentials",
        html: htmlContent,
      });
      console.log(`✓ Instructor welcome email sent successfully to ${user.email}`);
    } catch (err) {
      console.log(`[Email Fallback] To: ${user.email} | Password: ${password}`);
    }
  }
}
