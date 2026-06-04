"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

// ── Zod Schemas ────────────────────────────────────────────────────────────────

export const ContactSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export const DonationSchema = z.object({
  amount: z.number().min(100, "Minimum donation is ₹100"),
  purpose: z.string().min(1, "Please select a purpose"),
  recurring: z.boolean().default(false),
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  currency: z.enum(["INR", "USD"]).default("INR"),
});

export const ApplicationStep1Schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
});

export const ApplicationStep2Schema = z.object({
  church: z.string().min(2, "Please enter your church name"),
  denomination: z.string().optional(),
  yearsInMinistry: z.string().min(1, "Please enter years in ministry"),
  ministryRole: z.string().min(1, "Please select your ministry role"),
});

export const ApplicationStep3Schema = z.object({
  courseId: z.string().min(1, "Please select a course"),
  format: z.string().optional(),
  scholarshipRequest: z.boolean().default(false),
  scholarshipReason: z.string().optional(),
});

export const ApplicationStep4Schema = z.object({
  testimony: z.string().min(100, "Please share at least 100 characters about your testimony"),
});

export const PrayerRequestSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  subject: z.string().min(5, "Please enter a subject"),
  request: z.string().min(20, "Please provide more detail about your prayer need"),
  isPublic: z.boolean().default(false),
});

// ── Server Action Response Type ────────────────────────────────────────────────

type ActionResult<T = undefined> =
  | { success: true; data?: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Contact Form Action ────────────────────────────────────────────────────────

export async function submitContactForm(
  formData: z.infer<typeof ContactSchema>
): Promise<ActionResult> {
  const result = ContactSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // TODO: Send email via Resend
    // await resend.emails.send({ ... });

    // TODO: Save to DB
    // await prisma.contactSubmission.create({ data: result.data });

    console.log("[Contact Form Submitted]", result.data);

    return {
      success: true,
      message: "Thank you! We will respond within 1–2 business days.",
    };
  } catch (err) {
    console.error("Contact form error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ── Donation Action ────────────────────────────────────────────────────────────

export async function createDonationOrder(
  formData: z.infer<typeof DonationSchema>
): Promise<ActionResult<{ orderId: string; amount: number }>> {
  const result = DonationSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: "Invalid donation data" };
  }

  try {
    // TODO: Create Razorpay order for INR, Stripe PaymentIntent for USD
    // const order = await razorpay.orders.create({ amount: result.data.amount * 100, currency: 'INR' });

    const mockOrderId = `ORDER-${Date.now()}`;

    // TODO: Save pending donation to DB
    // await prisma.donation.create({ data: { ...result.data, status: 'PENDING', orderId: mockOrderId } });

    console.log("[Donation Order Created]", result.data);

    return {
      success: true,
      message: "Order created. Proceeding to payment.",
      data: { orderId: mockOrderId, amount: result.data.amount },
    };
  } catch (err) {
    console.error("Donation error:", err);
    return { success: false, error: "Could not create payment order. Please try again." };
  }
}

// ── Application Submission Action ─────────────────────────────────────────────

export async function submitApplication(applicationData: {
  step1: z.infer<typeof ApplicationStep1Schema>;
  step2: z.infer<typeof ApplicationStep2Schema>;
  step3: z.infer<typeof ApplicationStep3Schema>;
  step4: z.infer<typeof ApplicationStep4Schema>;
}): Promise<ActionResult<{ applicationId: string }>> {
  // Validate all steps
  const s1 = ApplicationStep1Schema.safeParse(applicationData.step1);
  const s2 = ApplicationStep2Schema.safeParse(applicationData.step2);
  const s3 = ApplicationStep3Schema.safeParse(applicationData.step3);
  const s4 = ApplicationStep4Schema.safeParse(applicationData.step4);

  if (!s1.success || !s2.success || !s3.success || !s4.success) {
    return { success: false, error: "Please complete all required fields in each step." };
  }

  try {
    const applicationId = `APP-${Date.now()}`;

    // TODO: Save application to DB
    // await prisma.application.create({
    //   data: {
    //     ...s1.data, ...s2.data, ...s3.data, ...s4.data,
    //     status: "PENDING",
    //     applicationId,
    //     submittedAt: new Date(),
    //   }
    // });

    // TODO: Send confirmation email
    // await resend.emails.send({ to: s1.data.email, ... });

    // TODO: Notify admin
    // await resend.emails.send({ to: process.env.ADMIN_EMAIL, ... });

    console.log("[Application Submitted]", { applicationId, ...applicationData });

    return {
      success: true,
      message: `Application submitted! Your ID is ${applicationId}. We will review and respond within 5–7 business days.`,
      data: { applicationId },
    };
  } catch (err) {
    console.error("Application error:", err);
    return { success: false, error: "Could not submit application. Please try again." };
  }
}

// ── Prayer Request Action ──────────────────────────────────────────────────────

export async function submitPrayerRequest(
  formData: z.infer<typeof PrayerRequestSchema>
): Promise<ActionResult> {
  const result = PrayerRequestSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // TODO: Save to DB
    // await prisma.prayerRequest.create({ data: result.data });

    console.log("[Prayer Request Submitted]", result.data);
    revalidatePath("/dashboard/student/prayer");

    return {
      success: true,
      message: "Your prayer request has been submitted. Our prayer team is standing with you.",
    };
  } catch (err) {
    console.error("Prayer request error:", err);
    return { success: false, error: "Could not submit prayer request. Please try again." };
  }
}

// ── Admin: Update Application Status ─────────────────────────────────────────

export async function updateApplicationStatus(
  applicationId: string,
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "INFO_REQUESTED",
  adminNote?: string
): Promise<ActionResult> {
  try {
    // TODO: DB update
    // await prisma.application.update({
    //   where: { id: applicationId },
    //   data: { status, adminNotes: adminNote, reviewedAt: new Date() }
    // });

    // TODO: Send status email to applicant

    revalidatePath("/dashboard/admin/applications");
    console.log("[Application Status Updated]", { applicationId, status, adminNote });

    return { success: true, message: `Application ${status.toLowerCase()}.` };
  } catch (err) {
    console.error("Status update error:", err);
    return { success: false, error: "Could not update status. Please try again." };
  }
}

// ── Mark Lesson Complete ───────────────────────────────────────────────────────

export async function markLessonComplete(
  lessonId: string,
  userId: string
): Promise<ActionResult> {
  try {
    // TODO: Upsert lesson progress
    // await prisma.lessonProgress.upsert({
    //   where: { userId_lessonId: { userId, lessonId } },
    //   update: { completedAt: new Date() },
    //   create: { userId, lessonId, completedAt: new Date() }
    // });

    // TODO: Check if course is complete and auto-issue certificate

    revalidatePath("/dashboard/student/courses");
    console.log("[Lesson Marked Complete]", { lessonId, userId });

    return { success: true, message: "Lesson marked as complete!" };
  } catch (err) {
    console.error("Lesson complete error:", err);
    return { success: false, error: "Could not mark lesson complete." };
  }
}
