import { QueryClient } from '@tanstack/react-query';

// Cấu hình QueryClient với các options tối ưu
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Thời gian cache (5 phút)
      staleTime: 5 * 60 * 1000,
      // Thời gian giữ cache trong bộ nhớ (10 phút)
      gcTime: 10 * 60 * 1000,
      // Retry khi fetch thất bại
      retry: 1,
      // Không refetch khi window focus (tùy chỉnh theo nhu cầu)
      refetchOnWindowFocus: false,
      // Refetch khi reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry cho mutations
      retry: 0,
    },
  },
});

// Query Keys - Tập trung quản lý các keys
export const queryKeys = {
  // Auth
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
    checkEmail: (email: string) => ['auth', 'checkEmail', email] as const,
  },
  // Courses (ví dụ)
  courses: {
    all: ['courses'] as const,
    detail: (id: string) => ['courses', id] as const,
    byStudent: (studentId: string) => ['courses', 'student', studentId] as const,
    byLecturer: (lecturerId: string) => ['courses', 'lecturer', lecturerId] as const,
  },
  // Assignments (ví dụ)
  assignments: {
    all: ['assignments'] as const,
    detail: (id: string) => ['assignments', id] as const,
    byCourse: (courseId: string) => ['assignments', 'course', courseId] as const,
  },
};