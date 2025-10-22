import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Tạo axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==== AUTH API ====
export const authApi = {

  login: async (email: string, password: string) => {
    return api.post('/auth/login', { 
      email, 
      password 
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) => {
    return api.post('/auth/register/student', userData);
    // Hoặc '/auth/register/lecturer' nếu đăng ký làm mentor
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

export default api;

