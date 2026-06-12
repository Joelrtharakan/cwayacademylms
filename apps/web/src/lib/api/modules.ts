import { api } from "@/store/auth.store";

export const getModules = async (courseId: string) => {
  const res = await api.get(`/courses/${courseId}/modules`);
  return res.data.data;
};

export const createModule = async (courseId: string, data: any) => {
  const res = await api.post(`/courses/${courseId}/modules`, data);
  return res.data.data;
};

export const updateModule = async (courseId: string, moduleId: string, data: any) => {
  const res = await api.put(`/courses/${courseId}/modules/${moduleId}`, data);
  return res.data.data;
};

export const deleteModule = async (courseId: string, moduleId: string) => {
  const res = await api.delete(`/courses/${courseId}/modules/${moduleId}`);
  return res.data;
};

export const reorderModules = async (courseId: string, orderedIds: string[]) => {
  const res = await api.put(`/courses/${courseId}/modules/reorder`, { orderedIds });
  return res.data;
};

// Lessons (Videos, Text)
export const createLesson = async (moduleId: string, data: any) => {
  const res = await api.post(`/modules/${moduleId}/lessons`, data);
  return res.data.data;
};

export const updateLesson = async (lessonId: string, data: any) => {
  const res = await api.put(`/lessons/${lessonId}`, data);
  return res.data.data;
};

export const deleteLesson = async (lessonId: string) => {
  const res = await api.delete(`/lessons/${lessonId}`);
  return res.data;
};

export const reorderLessons = async (moduleId: string, orderedIds: string[]) => {
  const res = await api.put(`/modules/${moduleId}/lessons/reorder`, { orderedIds });
  return res.data;
};

// Video Upload
export const uploadLessonVideo = async (lessonId: string, file: File) => {
  const formData = new FormData();
  formData.append("video", file);
  const res = await api.post(`/lessons/${lessonId}/upload-video`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const getLessonVideoStatus = async (lessonId: string) => {
  const res = await api.get(`/lessons/${lessonId}/video-status`);
  return res.data.data;
};

// Reading Materials
export const createReadingMaterial = async (moduleId: string, title: string, description: string, file: File) => {
  const formData = new FormData();
  formData.append("title", title);
  if (description) formData.append("description", description);
  formData.append("file", file);
  const res = await api.post(`/modules/${moduleId}/reading-materials`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const getReadingMaterials = async (moduleId: string) => {
  const res = await api.get(`/modules/${moduleId}/reading-materials`);
  return res.data.data;
};

export const deleteReadingMaterial = async (id: string) => {
  const res = await api.delete(`/reading-materials/${id}`);
  return res.data;
};

// Assignments
export const createAssignment = async (moduleId: string, data: any) => {
  const res = await api.post(`/modules/${moduleId}/assignment`, data);
  return res.data.data;
};

export const getAssignments = async (moduleId: string) => {
  const res = await api.get(`/modules/${moduleId}/assignments`);
  return res.data.data;
};

export const updateAssignment = async (assignmentId: string, data: any) => {
  const res = await api.put(`/assignments/${assignmentId}`, data);
  return res.data.data;
};

export const deleteAssignment = async (assignmentId: string) => {
  const res = await api.delete(`/assignments/${assignmentId}`);
  return res.data;
};

export const uploadAssignmentAttachment = async (assignmentId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/assignments/${assignmentId}/upload-attachment`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const getAssignmentSubmissions = async (assignmentId: string) => {
  const res = await api.get(`/assignments/${assignmentId}/submissions`);
  return res.data.data;
};

export const gradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
  const res = await api.put(`/submissions/${submissionId}/grade`, { grade, feedback });
  return res.data.data;
};

// Quizzes
export const createQuiz = async (moduleId: string, data: any) => {
  const res = await api.post(`/modules/${moduleId}/quiz`, data);
  return res.data.data;
};

export const getQuizzes = async (moduleId: string) => {
  const res = await api.get(`/modules/${moduleId}/quizzes`);
  return res.data.data;
};

export const updateQuiz = async (quizId: string, data: any) => {
  const res = await api.put(`/quizzes/${quizId}`, data);
  return res.data.data;
};

export const deleteQuiz = async (quizId: string) => {
  const res = await api.delete(`/quizzes/${quizId}`);
  return res.data;
};

// Questions
export const createQuestion = async (quizId: string, data: any) => {
  const res = await api.post(`/quizzes/${quizId}/questions`, data);
  return res.data.data;
};

export const updateQuestion = async (questionId: string, data: any) => {
  const res = await api.put(`/questions/${questionId}`, data);
  return res.data.data;
};

export const deleteQuestion = async (questionId: string) => {
  const res = await api.delete(`/questions/${questionId}`);
  return res.data;
};

export const reorderQuestions = async (quizId: string, orderedIds: string[]) => {
  const res = await api.put(`/quizzes/${quizId}/questions/reorder`, { orderedIds });
  return res.data;
};
