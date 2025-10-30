import { create } from 'zustand';
import { getCoursesService } from '../api/courseApi';
import type { Course } from '../util/courseUtils';

interface CourseStore {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getCourses: () => Promise<void>;
  setCourses: (courses: Course[]) => void;
  clearError: () => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  // State
  courses: [],
  isLoading: false,
  error: null,

  // Actions
  getCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await getCoursesService();
      set({ courses, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error?.response?.data?.message || 'Lỗi khi tải danh sách khóa học',
        isLoading: false 
      });
    }
  },

  setCourses: (courses) => set({ courses }),
  
  clearError: () => set({ error: null }),
}));