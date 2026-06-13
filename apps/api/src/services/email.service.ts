import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key')
const FROM   = process.env.EMAIL_FROM!
const APP    = process.env.APP_URL!

// Base HTML wrapper — CWAY branded
function wrap(content: string, preview: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{margin:0;padding:0;background:#F5F0E8;font-family:Arial,sans-serif}
    .w{max-width:600px;margin:0 auto}
    .h{background:#1C2B1E;padding:24px 32px;text-align:center}
    .tag{color:#C9973A;font-size:11px;letter-spacing:.12em;
         text-transform:uppercase;margin-top:6px}
    .b{background:#fff;padding:36px 32px}
    .h1{font-family:Georgia,serif;font-size:26px;color:#1C2B1E;
        font-style:italic;margin:0 0 14px}
    .p{font-size:15px;color:#1C2B1E;line-height:1.7;margin:0 0 14px}
    .sc{border-left:3px solid #C9973A;padding:12px 16px;margin:18px 0;
        background:rgba(201,151,58,0.06)}
    .sc p{font-family:Georgia,serif;font-style:italic;
          font-size:15px;color:#A8792A;margin:0}
    .btn{display:inline-block;background:#C9973A;color:#1C2B1E;
         text-decoration:none;padding:13px 30px;border-radius:999px;
         font-size:12px;font-weight:700;letter-spacing:.08em;
         text-transform:uppercase;margin:8px 0}
    .f{background:#1C2B1E;padding:20px 32px;text-align:center}
    .ft{color:#8A9E8C;font-size:11px;line-height:1.6}
    .fl{color:#C9973A;text-decoration:none}
  </style></head>
  <body>
  <div style="display:none;max-height:0;overflow:hidden">${preview}</div>
  <div class="w">
    <div class="h">
      <img src="${process.env.CWAY_LOGO_URL}" height="38" alt="CWAY Academy">
      <div class="tag">Coach · Challenge · Commission</div>
    </div>
    <div class="b">${content}</div>
    <div class="f">
      <p class="ft">CWAY Academy — A Ministry of CWAY Missions Religious Trust<br>
      Bangalore, Karnataka, India<br>
      <a class="fl" href="mailto:support@cwayacademy.com">support@cwayacademy.com</a>
      &nbsp;·&nbsp;
      <a class="fl" href="${APP}">${APP.replace('https://', '')}</a></p>
    </div>
  </div></body></html>`
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`)
    return
  }
  await resend.emails.send({ from: FROM, to, subject, html })
}

// ── THE 7 EMAIL FUNCTIONS ────────────────────────────────

export async function sendVerificationEmail(
  user: { name: string; email: string },
  token: string
) {
  const link = `${APP}/verify-email?token=${token}`
  await send(user.email, 'Verify your CWAY Academy account',
    wrap(`
      <h1 class="h1">Welcome to CWAY Academy!</h1>
      <p class="p">Hi ${user.name}, thank you for creating an account.
        Click below to verify your email and begin your journey.</p>
      <p><a class="btn" href="${link}">Verify My Email</a></p>
      <div class="sc"><p>"Commit your work to the Lord, and your plans
        will be established."</p></div>
      <p class="p" style="font-size:12px;color:#8A9E8C">
        This link expires in 24 hours.</p>
    `, 'Click to verify your email address'))
}

export async function sendWelcomeEmail(
  user: { name: string; email: string }
) {
  await send(user.email, 'Welcome to CWAY Academy!',
    wrap(`
      <h1 class="h1">Welcome, ${user.name}!</h1>
      <p class="p">You are now part of a community of frontline leaders
        being equipped for God's Great Commission.</p>
      <p><a class="btn" href="${APP}/courses">Browse Courses</a></p>
      <div class="sc"><p>"Study to show yourself approved to God, a worker
        who does not need to be ashamed." — 2 Timothy 2:15</p></div>
    `, "Your CWAY Academy account is ready"))
}

export async function sendPasswordResetEmail(
  user: { name: string; email: string },
  token: string
) {
  const link = `${APP}/reset-password?token=${token}`
  await send(user.email, 'Reset your CWAY Academy password',
    wrap(`
      <h1 class="h1">Password Reset</h1>
      <p class="p">Hi ${user.name}, you requested a password reset.
        This link expires in 1 hour.</p>
      <p><a class="btn" href="${link}">Reset My Password</a></p>
      <p class="p" style="font-size:12px;color:#8A9E8C">
        If you did not request this, please ignore this email.</p>
    `, 'Your password reset link (expires in 1 hour)'))
}

export async function sendEnrollmentConfirmationEmail(
  user: { name: string; email: string },
  course: { title: string; id: string; moduleNumber?: number | null;
            weeksDuration: number; instructorName: string;
            welcomeMessage?: string | null; scriptureRef?: string | null }
) {
  await send(user.email,
    `You are enrolled in "${course.title}"!`,
    wrap(`
      <h1 class="h1">Enrollment Confirmed!</h1>
      <p class="p">Hi ${user.name}, you are now enrolled in:</p>
      <div style="border:1px solid rgba(201,151,58,0.3);border-radius:8px;
                  padding:16px;margin:16px 0;background:#fdf8ef">
        <strong>${course.title}</strong><br>
        ${course.moduleNumber ? `Module ${course.moduleNumber} · ` : ''}
        ${course.weeksDuration} Weeks ·
        Instructor: ${course.instructorName}
      </div>
      <p><a class="btn" href="${APP}/student/courses/${course.id}/learn">
        Start Learning</a></p>
      ${course.scriptureRef
        ? `<div class="sc"><p>"${course.scriptureRef}"</p></div>` : ''}
      ${course.welcomeMessage
        ? `<p class="p">${course.welcomeMessage}</p>` : ''}
    `, `Start learning: ${course.title}`))
}

export async function sendCertificateIssuedEmail(
  user: { name: string; email: string },
  course: { title: string },
  uniqueCode: string
) {
  await send(user.email,
    `Your certificate is ready — "${course.title}"`,
    wrap(`
      <h1 class="h1">Congratulations, ${user.name}!</h1>
      <p class="p">You have successfully completed
        <strong>${course.title}</strong>.</p>
      <p><a class="btn" href="${APP}/student/certificates">
        Download Certificate</a></p>
      <p><a href="${APP}/certificate/${uniqueCode}"
            style="color:#C9973A;font-size:13px">
        Verify online →</a></p>
      <div class="sc"><p>"Well done, good and faithful servant."
        — Matthew 25:21</p></div>
    `, 'Download your certificate of completion'))
}

export async function sendCourseApprovedEmail(
  instructor: { name: string; email: string },
  course: { title: string; slug: string; id: string }
) {
  await send(instructor.email,
    `Your course has been approved — "${course.title}"`,
    wrap(`
      <h1 class="h1">Course Approved!</h1>
      <p class="p">Hi ${instructor.name}, your course
        "<strong>${course.title}</strong>" has been reviewed
        and is now live on CWAY Academy.</p>
      <p><a class="btn" href="${APP}/courses/${course.slug}">
        View Your Course</a></p>
      <p><a href="${APP}/instructor/courses/${course.id}/students"
            style="color:#C9973A;font-size:13px">
        View enrollments →</a></p>
    `, `"${course.title}" is now live`))
}

export async function sendSponsorThankYouEmail(
  sponsor: { name: string; email: string },
  amount: number
) {
  await send(sponsor.email,
    `Thank you for your generosity, ${sponsor.name}!`,
    wrap(`
      <h1 class="h1">Thank You, ${sponsor.name}!</h1>
      <p class="p">Your donation of
        <strong>₹${amount.toLocaleString()}</strong>
        has been received. Your gift sponsors a frontline leader
        through 15 months of theological training.</p>
      <div class="sc"><p>"He who is generous will be blessed."
        — Proverbs 22:9</p></div>
      <p class="p">If you have questions, contact
        <a href="mailto:support@cwayacademy.com"
           style="color:#C9973A">support@cwayacademy.com</a></p>
    `, 'Your sponsorship donation is confirmed'))
}

export async function sendInstructorWelcomeEmail(
  instructor: { name: string; email: string },
  password: string
) {
  await send(instructor.email,
    `Welcome to CWAY Academy as an Instructor!`,
    wrap(`
      <h1 class="h1">Welcome, ${instructor.name}!</h1>
      <p class="p">An admin has created an instructor account for you on CWAY Academy.</p>
      <p class="p">Your temporary password is: <strong>${password}</strong></p>
      <p class="p">Please log in and change your password immediately.</p>
      <p><a class="btn" href="${APP}/login">Log In to Dashboard</a></p>
    `, 'Your instructor account is ready'))
}
