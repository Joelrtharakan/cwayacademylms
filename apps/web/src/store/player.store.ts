import { create } from 'zustand';

interface PlayerState {
  courseId: string | null;
  lessonId: string | null;
  enrollmentId: string | null;
  activeTab: 'lessons' | 'readings' | 'assignments' | 'quizzes' | 'announcements' | 'discussions';
  notesPanelOpen: boolean;
  setCourseId: (id: string) => void;
  setLessonId: (id: string) => void;
  setEnrollmentId: (id: string) => void;
  setActiveTab: (tab: any) => void;
  toggleNotesPanel: () => void;
  setNotesPanelOpen: (open: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  courseId: null,
  lessonId: null,
  enrollmentId: null,
  activeTab: 'lessons',
  notesPanelOpen: false,
  setCourseId: (id) => set({ courseId: id }),
  setLessonId: (id) => set({ lessonId: id }),
  setEnrollmentId: (id) => set({ enrollmentId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleNotesPanel: () => set((state) => ({ notesPanelOpen: !state.notesPanelOpen })),
  setNotesPanelOpen: (open) => set({ notesPanelOpen: open }),
}));
