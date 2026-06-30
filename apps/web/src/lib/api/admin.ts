import { api } from "@/store/auth.store";


// ─── STATS & ANALYTICS ───────────────────────────────────────────────────────

export const getAdminStats = () =>
  api.get(`/admin/stats`).then((r) => r.data.data);

export const getRevenueAnalytics = (period: "7d" | "30d" | "12m" = "12m") =>
  api.get(`/admin/analytics/revenue`, { params: { period } }).then((r) => r.data.data);

export const getUserAnalytics = (period: "30d" | "12m" = "12m") =>
  api.get(`/admin/analytics/users`, { params: { period } }).then((r) => r.data.data);

export const getCourseAnalytics = () =>
  api.get(`/admin/analytics/courses`).then((r) => r.data.data);

export const getEnrollmentAnalytics = (period: "30d" | "12m" = "12m") =>
  api.get(`/admin/analytics/enrollments`, { params: { period } }).then((r) => r.data.data);

export const getRecentEnrollments = (limit: number = 8) =>
  api.get(`/admin/analytics/recent-enrollments`, { params: { limit } }).then((r) => r.data.data);

export const getStudentTimeAnalytics = (limit: number = 10) =>
  api.get(`/admin/analytics/students-time`, { params: { limit } }).then((r) => r.data.data);

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
  api.get(`/admin/users`, { params: filters }).then((r) => r.data.data);

export const getUserById = (id: string) =>
  api.get(`/admin/users/${id}`).then((r) => r.data.data);

export const updateUser = (id: string, data: Record<string, any>) =>
  api.put(`/admin/users/${id}`, data).then((r) => r.data.data);

export const banUser = (id: string, reason?: string) =>
  api.post(`/admin/users/${id}/ban`, { reason }).then((r) => r.data);

export const unbanUser = (id: string) =>
  api.post(`/admin/users/${id}/unban`).then((r) => r.data);

export const deleteUser = (id: string) =>
  api.delete(`/admin/users/${id}`).then((r) => r.data);

export const impersonateUser = (id: string) =>
  api.post(`/admin/users/${id}/impersonate`).then((r) => r.data.data);

export const exportUsersCSV = (filters: UserFilters = {}) => {
  const params = new URLSearchParams(filters as any).toString();
  window.open(`${api.defaults.baseURL}/admin/users/export?${params}`);
};

// ─── INSTRUCTORS ─────────────────────────────────────────────────────────────

export const getInstructors = async () => {
  const { data } = await api.get("/admin/instructors");
  return data.data;
};

export const createInstructor = async (payload: { name: string; email: string }) => {
  const { data } = await api.post("/admin/instructors", payload);
  return data.data;
};

export const updateInstructorPayout = async (id: string, percentage: number) =>
  api.put(`/admin/instructors/${id}/payout-percentage`, { percentage }).then((r) => r.data.data);

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
  api.get(`/admin/courses`, { params: filters }).then((r) => r.data.data);

export const duplicateCourse = (id: string, programId?: string) =>
  api.post(`/admin/courses/${id}/duplicate`, { programId }).then((r) => r.data.data);

export const approveCourse = (id: string) =>
  api.post(`/admin/courses/${id}/approve`).then((r) => r.data);

export const rejectCourse = (id: string, reason: string) =>
  api.post(`/admin/courses/${id}/reject`, { reason }).then((r) => r.data);

export const featureCourse = (id: string, isFeatured: boolean) =>
  api.put(`/admin/courses/${id}/feature`, { isFeatured }).then((r) => r.data.data);

export const deleteCourse = (id: string, confirm?: boolean) =>
  api.delete(`/admin/courses/${id}`, { params: confirm ? { confirm: "true" } : {} }).then((r) => r.data);

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const getCategories = () =>
  api.get(`/admin/categories`).then((r) => r.data.data);

export const createCategory = (data: { name: string; slug?: string; icon?: string; parentId?: string }) =>
  api.post(`/admin/categories`, data).then((r) => r.data.data);

export const updateCategory = (id: string, data: { name?: string; slug?: string; icon?: string; parentId?: string }) =>
  api.put(`/admin/categories/${id}`, data).then((r) => r.data.data);

export const deleteCategory = (id: string) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data);

export const reorderCategories = (orderedIds: string[]) =>
  api.put(`/admin/categories/reorder`, { orderedIds }).then((r) => r.data);

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
  api.get(`/admin/payments`, { params: filters }).then((r) => r.data.data);

export const refundPayment = (id: string) =>
  api.post(`/admin/payments/${id}/refund`).then((r) => r.data);

// ─── SPONSORSHIPS ────────────────────────────────────────────────────────────

export const getSponsorships = (filters: { status?: string; page?: number; limit?: number } = {}) =>
  api.get(`/admin/sponsorships`, { params: filters }).then((r) => r.data.data);

export const linkSponsorship = (id: string, studentId: string, courseId: string) =>
  api.put(`/admin/sponsorships/${id}/link`, { studentId, courseId }).then((r) => r.data);

// ─── COUPONS ─────────────────────────────────────────────────────────────────

export const getCoupons = () =>
  api.get(`/admin/coupons`).then((r) => r.data.data);

export const createCoupon = (data: {
  code: string;
  discount: number;
  type: "PERCENT" | "FIXED";
  maxUses?: number;
  expiresAt?: string;
  courseId?: string;
}) => api.post(`/admin/coupons`, data).then((r) => r.data.data);

export const updateCoupon = (id: string, data: { isActive?: boolean; expiresAt?: string; maxUses?: number }) =>
  api.put(`/admin/coupons/${id}`, data).then((r) => r.data.data);

export const deleteCoupon = (id: string) =>
  api.delete(`/admin/coupons/${id}`).then((r) => r.data);

// ─── CERTIFICATE TEMPLATES ───────────────────────────────────────────────────

export const getCertificateTemplates = () =>
  api.get(`/admin/certificate-templates`).then((r) => r.data.data);

export const createCertificateTemplate = (data: any) =>
  api.post(`/admin/certificate-templates`, data).then((r) => r.data.data);

export const updateCertificateTemplate = (id: string, data: any) =>
  api.put(`/admin/certificate-templates/${id}`, data).then((r) => r.data.data);

export const deleteCertificateTemplate = (id: string) =>
  api.delete(`/admin/certificate-templates/${id}`).then((r) => r.data);

export const previewCertificateTemplate = (id: string, params: Record<string, string>) =>
  api.get(`/admin/certificate-templates/${id}/preview`, { params }).then((r) => r.data.data);

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────

export const getEmailTemplates = () =>
  api.get(`/admin/email-templates`).then((r) => r.data.data);

export const createEmailTemplate = (data: { name: string; subject: string; htmlBody: string }) =>
  api.post(`/admin/email-templates`, data).then((r) => r.data.data);

export const updateEmailTemplate = (id: string, data: { subject?: string; htmlBody?: string }) =>
  api.put(`/admin/email-templates/${id}`, data).then((r) => r.data.data);

export const previewEmailTemplate = (id: string, sampleData: Record<string, string>) =>
  api.post(`/admin/email-templates/${id}/preview`, { sampleData }).then((r) => r.data.data);

export const testEmailTemplate = (id: string, toEmail: string, sampleData: Record<string, string>) =>
  api.post(`/admin/email-templates/${id}/test`, { toEmail, sampleData }).then((r) => r.data);

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const getNotifications = (filters: { userId?: string; type?: string; isRead?: string; page?: number; limit?: number } = {}) =>
  api.get(`/admin/notifications`, { params: filters }).then((r) => r.data.data);

export const broadcastNotification = (data: {
  targetRole: "ALL" | "ADMIN" | "INSTRUCTOR" | "STUDENT";
  targetUserIds?: string[];
  title: string;
  body: string;
  link?: string;
  sendEmail: boolean;
}) => api.post(`/admin/notifications/broadcast`, data).then((r) => r.data);

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export const getSettings = () =>
  api.get(`/admin/settings`).then((r) => r.data.data);

export const updateSettings = (data: Record<string, any>) =>
  api.put(`/admin/settings`, data).then((r) => r.data.data);

// ─── PROGRAMS (LMS WORKFLOW) ──────────────────────────────────────────────────

export interface ProgramFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getPrograms = (filters: ProgramFilters = {}) =>
  api.get(`/admin/programs`, { params: filters }).then((r) => r.data.data);

export const getProgramById = (id: string) =>
  api.get(`/admin/programs/${id}`).then((r) => r.data.data);

export const createProgram = (data: {
  title: string;
  description?: string;
  duration?: string;
  tags?: string[];
  status?: string;
}) => api.post(`/admin/programs`, data).then((r) => r.data.data);

export const updateProgram = (id: string, data: {
  title?: string;
  description?: string;
  duration?: string;
  tags?: string[];
  status?: string;
}) => api.put(`/admin/programs/${id}`, data).then((r) => r.data.data);

export const deleteProgram = (id: string) =>
  api.delete(`/admin/programs/${id}`).then((r) => r.data);


export const removeCourseFromProgram = (programId: string, courseId: string) =>
  api.delete(`/admin/programs/${programId}/courses/${courseId}`).then((r) => r.data);

export const getProgramStudents = (programId: string) =>
  api.get(`/admin/programs/${programId}/students`).then((r) => r.data.data);

export const getProgramStudentDetails = async (programId: string, studentId: string) => {
  const res = await api.get(`/admin/programs/${programId}/students/${studentId}`);
  return res.data.data;
};

export const getProgramStudentGrades = async (programId: string, studentId: string) => {
  const res = await api.get(`/admin/programs/${programId}/students/${studentId}/grades`);
  return res.data.data;
};

export const addCourseToProgram = (programId: string, data: {
  title: string;
  description?: string;
  price?: number;
  instructorId?: string;
}) => api.post(`/admin/programs/${programId}/courses`, data).then((r) => r.data.data);

export const assignInstructorToCourse = (courseId: string, data: {
  instructorId: string;
  adminNote?: string;
}) => api.post(`/admin/courses/${courseId}/assign-instructor`, data).then((r) => r.data);

// ─── PROGRAM APPLICATIONS ───────────────────────────────────────────────────────

export const getApplications = (filters: { status?: string; page?: number; limit?: number } = {}) =>
  api.get(`/admin/applications`, { params: filters }).then((r) => r.data.data);

// ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────

export interface LogFilters {
  search?: string;
  action?: string;
  status?: string;
  userId?: string;
  role?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const getLogs = (filters: LogFilters = {}) =>
  api.get(`/admin/logs`, { params: filters }).then((r) => r.data.data);

export const getLogStats = (days = 30) =>
  api.get(`/admin/logs/stats`, { params: { days } }).then((r) => r.data.data);
