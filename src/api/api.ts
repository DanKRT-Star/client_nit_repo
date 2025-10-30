import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
if(!API_URL) {
  throw new Error('Missing VITE_API_BASE_URL. Cấu hình trong .env.[mode]');
}
// Tạo axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor để thêm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Định nghĩa Types cho dữ liệu đăng ký
export type StudentRegisterData = {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    studentCode: string;
    major?: string;
    enrollmentYear?: number;
    className?: string;
}

export type LecturerRegisterData = {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    lecturerCode: string;
    department?: string;
    title: 'TA' | 'LECTURER' | 'SENIOR_LECTURER' | 'ASSOCIATE_PROFESSOR' | 'PROFESSOR';
    bio?: string;
}

// ==== AUTH API ====
export const authApi = {

  login: async (email: string, password: string) => {
    return api.post('/auth/login', { 
      email, 
      password 
    });
  },

  // Register Student
  registerStudent: async (data: StudentRegisterData) => {
    return api.post('/auth/register/student', data);
  },

  // Register Lecturer
  registerLecturer: async (data: LecturerRegisterData) => {
    return api.post('/auth/register/lecturer', data);
  },

  // Lấy thông tin user hiện tại (sau khi login)
  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  // Kiểm tra email có tồn tại không (nếu API hỗ trợ)
  checkEmailExists: (email: string) => {
    // Tùy thuộc vào API của bạn
    return api.get(`/users?email=${email}`);
  },
};

// ==== COURSE API ====
export const courseApi = {
  // Lấy danh sách tất cả khóa học
  getCourses: async () => {
    return api.get('/courses');
  },

  // Lấy chi tiết 1 khóa học theo id
  getCourseById: async (courseId: string) => {
    return api.get(`/courses/${courseId}`);
  },

  // (Tuỳ chọn) Lấy danh sách khóa học của giảng viên hiện tại
  getLecturerCourses: async () => {
    return api.get('/lecturer/courses');
  },

  // (Tuỳ chọn) Thêm khóa học mới
  createCourse: async (data: { title: string; description?: string }) => {
    return api.post('/courses', data);
  },
};

export default api;