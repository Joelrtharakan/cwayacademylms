import { api } from "@/store/auth.store";

// ─── Stats ───────────────────────────────────────────────────────────────────
export const getInstructorStats = () =>
  api.get("/instructor/stats").then((r) => r.data.data);

export const getCourseAnalytics = (courseId: string) =>
  api.get(`/instructor/courses/${courseId}/analytics`).then((r) => r.data.data);

// ─── Courses ─────────────────────────────────────────────────────────────────
export const getInstructorCourses = (params: any = {}) =>
  api.get("/courses", { params: { ...params, limit: 100 } }).then((r) => r.data.data);

export const createCourse = (data: any) =>
  api.post("/courses", data).then((r) => r.data.data);

export const getCourseById = (id: string) =>
  api.get(`/courses/${id}`).then((r) => r.data.data);

export const updateCourse = (id: string, data: any) =>
  api.put(`/courses/${id}`, data).then((r) => r.data.data);

export const deleteCourse = (id: string) =>
  api.delete(`/courses/${id}`).then((r) => r.data);

export const submitForReview = (id: string) =>
  api.post(`/courses/${id}/submit-review`).then((r) => r.data);

export const duplicateCourse = (id: string) =>
  api.post(`/courses/${id}/duplicate`).then((r) => r.data.data);

// Uploads
export const uploadThumbnail = (courseId: string, file: File) => {
  const form = new FormData();
  form.append("thumbnail", file);
  return api.post(`/courses/${courseId}/upload-thumbnail`, form).then((r) => r.data.data);
};

export const uploadPromoVideo = (courseId: string, file: File, onProgress?: (pct: number) => void) => {
  const form = new FormData();
  form.append("video", file);
  return api.post(`/courses/${courseId}/upload-promo-video`, form, {
    onUploadProgress: (e) => { if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); },
  }).then((r) => r.data.data);
};

// ─── Sections ────────────────────────────────────────────────────────────────
export const createSection = (courseId: string, data: { title: string; order?: number }) =>
  api.post(`/courses/${courseId}/sections`, data).then((r) => r.data.data);

export const updateSection = (courseId: string, sectionId: string, data: any) =>
  api.put(`/courses/${courseId}/sections/${sectionId}`, data).then((r) => r.data.data);

export const deleteSection = (courseId: string, sectionId: string) =>
  api.delete(`/courses/${courseId}/sections/${sectionId}`).then((r) => r.data);

export const reorderSections = (courseId: string, orderedIds: string[]) =>
  api.put(`/courses/${courseId}/sections/reorder`, { orderedIds }).then((r) => r.data);

// ─── Lessons ─────────────────────────────────────────────────────────────────
export const createLesson = (sectionId: string, data: any) =>
  api.post(`/sections/${sectionId}/lessons`, data).then((r) => r.data.data);

export const updateLesson = (lessonId: string, data: any) =>
  api.put(`/lessons/${lessonId}`, data).then((r) => r.data.data);

export const deleteLesson = (lessonId: string) =>
  api.delete(`/lessons/${lessonId}`).then((r) => r.data);

export const reorderLessons = (sectionId: string, orderedIds: string[]) =>
  api.put(`/sections/${sectionId}/lessons/reorder`, { orderedIds }).then((r) => r.data);

export const uploadLessonVideo = (lessonId: string, file: File, onProgress?: (pct: number) => void) => {
  const form = new FormData();
  form.append("video", file);
  return api.post(`/lessons/${lessonId}/upload-video`, form, {
    onUploadProgress: (e) => { if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); },
  }).then((r) => r.data.data);
};

export const getLessonVideoStatus = (lessonId: string) =>
  api.get(`/lessons/${lessonId}/video-status`).then((r) => r.data.data);

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export const createQuiz = (lessonId: string, data: any) =>
  api.post(`/lessons/${lessonId}/quiz`, data).then((r) => r.data.data);

export const updateQuiz = (quizId: string, data: any) =>
  api.put(`/quizzes/${quizId}`, data).then((r) => r.data.data);

export const addQuestion = (quizId: string, data: any) =>
  api.post(`/quizzes/${quizId}/questions`, data).then((r) => r.data.data);

export const updateQuestion = (questionId: string, data: any) =>
  api.put(`/questions/${questionId}`, data).then((r) => r.data.data);

export const deleteQuestion = (questionId: string) =>
  api.delete(`/questions/${questionId}`).then((r) => r.data);

export const getQuizStats = (quizId: string) =>
  api.get(`/quizzes/${quizId}/stats`).then((r) => r.data.data);

export const getQuizAttempts = (quizId: string) =>
  api.get(`/quizzes/${quizId}/attempts`).then((r) => r.data.data);

// ─── Assignment ───────────────────────────────────────────────────────────────
export const createAssignment = (lessonId: string, data: any) =>
  api.post(`/lessons/${lessonId}/assignment`, data).then((r) => r.data.data);

export const updateAssignment = (assignmentId: string, data: any) =>
  api.put(`/assignments/${assignmentId}`, data).then((r) => r.data.data);

// ─── Grading ──────────────────────────────────────────────────────────────────
export const getInstructorAssignments = (params: any = {}) =>
  api.get("/instructor/assignments", { params }).then((r) => r.data.data);

export const gradeSubmission = (submissionId: string, data: { grade: number; feedback?: string }) =>
  api.put(`/submissions/${submissionId}/grade`, data).then((r) => r.data.data);

// ─── Forum ───────────────────────────────────────────────────────────────────
export const getForumPosts = (courseId: string, params?: any) =>
  api.get(`/courses/${courseId}/forum/posts`, { params }).then((r) => r.data.data);

export const createForumPost = (courseId: string, data: { title: string; content: string }) =>
  api.post(`/courses/${courseId}/forum/posts`, data).then((r) => r.data.data);

export const pinForumPost = (postId: string) =>
  api.put(`/forum/posts/${postId}/pin`).then((r) => r.data.data);

export const deleteForumPost = (postId: string) =>
  api.delete(`/forum/posts/${postId}`).then((r) => r.data);

export const createForumReply = (postId: string, content: string) =>
  api.post(`/forum/posts/${postId}/replies`, { content }).then((r) => r.data.data);

// ─── Revenue & Payouts ───────────────────────────────────────────────────────
export const getInstructorRevenue = () =>
  api.get("/instructor/revenue").then((r) => r.data.data);

export const requestPayout = (data: { amount: number; bankDetails?: string; note?: string }) =>
  api.post("/instructor/payouts/request", data).then((r) => r.data.data);

export const getPayoutHistory = () =>
  api.get("/instructor/payouts/history").then((r) => r.data.data);

// ─── Messages ────────────────────────────────────────────────────────────────
export const getConversations = () =>
  api.get("/messages").then((r) => r.data.data);

export const getMessageThread = (userId: string) =>
  api.get(`/messages/${userId}`).then((r) => r.data.data);

export const sendMessage = (receiverId: string, content: string) =>
  api.post("/messages", { receiverId, content }).then((r) => r.data.data);

// ─── Profile ─────────────────────────────────────────────────────────────────
export const updateMyProfile = (data: any) =>
  api.put("/users/me/profile", data).then((r) => r.data.data);

export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return api.post("/users/me/upload-avatar", form).then((r) => r.data.data);
};

// ─── Public Categories ────────────────────────────────────────────────────────
export const getCategories = () =>
  api.get("/categories").then((r) => r.data.data);
