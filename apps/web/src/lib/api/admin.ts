import { api } from "@/store/auth.store";

const BASE = "/admin";

// ─── STATS & ANALYTICS ───────────────────────────────────────────────────────

export const getAdminStats = () =>
  api.get(`${BASE}/stats`).then((r) => r.data.data);

export const getRevenueAnalytics = (period: "7d" | "30d" | "12m" = "12m") =>
  api.get(`${BASE}/analytics/revenue`, { params: { period } }).then((r) => r.data.data);

export const getUserAnalytics = (period: "30d" | "12m" = "12m") =>
  api.get(`${BASE}/analytics/users`, { params: { period } }).then((r) => r.data.data);

export const getCourseAnalytics = () =>
  api.get(`${BASE}/analytics/courses`).then((r) => r.data.data);

export const getEnrollmentAnalytics = (period: "30d" | "12m" = "12m") =>
  api.get(`${BASE}/analytics/enrollments`, { params: { period } }).then((r) => r.data.data);

// ─── USERS ───────────────────────────────────────────────────────────────────

export interface UserFilters {
  role?: string;
  status?: string;
  language?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export const getUsers = (filters: UserFilters = {}) =>
  api.get(`${BASE}/users`, { params: filters }).then((r) => r.data.data);

export const getUserById = (id: string) =>
  api.get(`${BASE}/users/${id}`).then((r) => r.data.data);

export const updateUser = (id: string, data: Record<string, any>) =>
  api.put(`${BASE}/users/${id}`, data).then((r) => r.data.data);

export const banUser = (id: string, reason?: string) =>
  api.post(`${BASE}/users/${id}/ban`, { reason }).then((r) => r.data);

export const unbanUser = (id: string) =>
  api.post(`${BASE}/users/${id}/unban`).then((r) => r.data);

export const deleteUser = (id: string) =>
  api.delete(`${BASE}/users/${id}`).then((r) => r.data);

export const impersonateUser = (id: string) =>
  api.post(`${BASE}/users/${id}/impersonate`).then((r) => r.data.data);

export const exportUsersCSV = (filters: UserFilters = {}) => {
  const params = new URLSearchParams(filters as any).toString();
  window.open(`${api.defaults.baseURL}${BASE}/users/export?${params}`);
};

// ─── INSTRUCTORS ─────────────────────────────────────────────────────────────

export const getInstructors = () =>
  api.get(`${BASE}/instructors`).then((r) => r.data.data);

export const updateInstructorPayout = (id: string, percentage: number) =>
  api.put(`${BASE}/instructors/${id}/payout-percentage`, { percentage }).then((r) => r.data.data);

// ─── COURSES ─────────────────────────────────────────────────────────────────

export interface CourseFilters {
  status?: string;
  search?: string;
  instructor?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export const getCourses = (filters: CourseFilters = {}) =>
  api.get(`${BASE}/courses`, { params: filters }).then((r) => r.data.data);

export const approveCourse = (id: string) =>
  api.post(`${BASE}/courses/${id}/approve`).then((r) => r.data);

export const rejectCourse = (id: string, reason: string) =>
  api.post(`${BASE}/courses/${id}/reject`, { reason }).then((r) => r.data);

export const featureCourse = (id: string, isFeatured: boolean) =>
  api.put(`${BASE}/courses/${id}/feature`, { isFeatured }).then((r) => r.data.data);

export const deleteCourse = (id: string, confirm?: boolean) =>
  api.delete(`${BASE}/courses/${id}`, { params: confirm ? { confirm: "true" } : {} }).then((r) => r.data);

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const getCategories = () =>
  api.get(`${BASE}/categories`).then((r) => r.data.data);

export const createCategory = (data: { name: string; slug?: string; icon?: string; parentId?: string }) =>
  api.post(`${BASE}/categories`, data).then((r) => r.data.data);

export const updateCategory = (id: string, data: { name?: string; slug?: string; icon?: string; parentId?: string }) =>
  api.put(`${BASE}/categories/${id}`, data).then((r) => r.data.data);

export const deleteCategory = (id: string) =>
  api.delete(`${BASE}/categories/${id}`).then((r) => r.data);

export const reorderCategories = (orderedIds: string[]) =>
  api.put(`${BASE}/categories/reorder`, { orderedIds }).then((r) => r.data);

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export interface PaymentFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getPayments = (filters: PaymentFilters = {}) =>
  api.get(`${BASE}/payments`, { params: filters }).then((r) => r.data.data);

export const refundPayment = (id: string) =>
  api.post(`${BASE}/payments/${id}/refund`).then((r) => r.data);

// ─── SPONSORSHIPS ────────────────────────────────────────────────────────────

export const getSponsorships = (filters: { status?: string; page?: number; limit?: number } = {}) =>
  api.get(`${BASE}/sponsorships`, { params: filters }).then((r) => r.data.data);

export const linkSponsorship = (id: string, studentId: string, courseId: string) =>
  api.put(`${BASE}/sponsorships/${id}/link`, { studentId, courseId }).then((r) => r.data);

// ─── COUPONS ─────────────────────────────────────────────────────────────────

export const getCoupons = () =>
  api.get(`${BASE}/coupons`).then((r) => r.data.data);

export const createCoupon = (data: {
  code: string;
  discount: number;
  type: "PERCENT" | "FIXED";
  maxUses?: number;
  expiresAt?: string;
  courseId?: string;
}) => api.post(`${BASE}/coupons`, data).then((r) => r.data.data);

export const updateCoupon = (id: string, data: { isActive?: boolean; expiresAt?: string; maxUses?: number }) =>
  api.put(`${BASE}/coupons/${id}`, data).then((r) => r.data.data);

export const deleteCoupon = (id: string) =>
  api.delete(`${BASE}/coupons/${id}`).then((r) => r.data);

// ─── CERTIFICATE TEMPLATES ───────────────────────────────────────────────────

export const getCertificateTemplates = () =>
  api.get(`${BASE}/certificate-templates`).then((r) => r.data.data);

export const createCertificateTemplate = (data: any) =>
  api.post(`${BASE}/certificate-templates`, data).then((r) => r.data.data);

export const updateCertificateTemplate = (id: string, data: any) =>
  api.put(`${BASE}/certificate-templates/${id}`, data).then((r) => r.data.data);

export const deleteCertificateTemplate = (id: string) =>
  api.delete(`${BASE}/certificate-templates/${id}`).then((r) => r.data);

export const previewCertificateTemplate = (id: string, params: Record<string, string>) =>
  api.get(`${BASE}/certificate-templates/${id}/preview`, { params }).then((r) => r.data.data);

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────

export const getEmailTemplates = () =>
  api.get(`${BASE}/email-templates`).then((r) => r.data.data);

export const updateEmailTemplate = (id: string, data: { subject?: string; htmlBody?: string }) =>
  api.put(`${BASE}/email-templates/${id}`, data).then((r) => r.data.data);

export const previewEmailTemplate = (id: string, sampleData: Record<string, string>) =>
  api.post(`${BASE}/email-templates/${id}/preview`, { sampleData }).then((r) => r.data.data);

export const testEmailTemplate = (id: string, toEmail: string, sampleData: Record<string, string>) =>
  api.post(`${BASE}/email-templates/${id}/test`, { toEmail, sampleData }).then((r) => r.data);

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const getNotifications = (filters: { userId?: string; type?: string; isRead?: string; page?: number; limit?: number } = {}) =>
  api.get(`${BASE}/notifications`, { params: filters }).then((r) => r.data.data);

export const broadcastNotification = (data: {
  targetRole: "ALL" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
  targetUserIds?: string[];
  title: string;
  body: string;
  link?: string;
  sendEmail: boolean;
}) => api.post(`${BASE}/notifications/broadcast`, data).then((r) => r.data);

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export const getSettings = () =>
  api.get(`${BASE}/settings`).then((r) => r.data.data);

export const updateSettings = (data: Record<string, any>) =>
  api.put(`${BASE}/settings`, data).then((r) => r.data.data);
