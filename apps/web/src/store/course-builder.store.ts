import { create } from 'zustand';

interface CourseBuilderState {
  activeModuleId: string | null;
  activeTab: 'overview' | 'videos' | 'readings' | 'assignments' | 'quizzes' | 'forums';
  
  setActiveModule: (id: string | null) => void;
  setActiveTab: (tab: 'overview' | 'videos' | 'readings' | 'assignments' | 'quizzes' | 'forums') => void;
}

export const useCourseBuilderStore = create<CourseBuilderState>((set) => ({
  activeModuleId: null,
  activeTab: 'overview',
  
  setActiveModule: (id) => set({ activeModuleId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
