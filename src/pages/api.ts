import axios from 'axios';

const API_URL = 'http://localhost:3002';

interface User {
  id: string | number;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  avatar: string;
  role: number;
  createdAt: string;
  updatedAt: string;
}

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const userApi = {
  // GET - Lấy danh sách users
  getAll: () => api.get('/users'),

  // GET - Lấy user theo ID
  getById: (id: string) => api.get(`/users/${id}`),

  // POST - Tạo user mới
  create: (userData: any) => api.post('/users', userData),

  // PUT - Cập nhật toàn bộ user
  update: (id: any, userData: any) => api.put(`/users/${id}`, userData),

  // PATCH - Cập nhật một phần user
  patch: (id: any, userData: any) => api.patch(`/users/${id}`, userData),

  // DELETE - Xóa user
  delete: (id: any) => api.delete(`/users/${id}`),
};

// ==== AUTH API ====
export const authApi = {
  // Đăng nhập check email và password
  login: (email: string, password: string) =>
    api.get(`/users?email=${email}&password=${password}`),

  // Đăng ký user mới
  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) => {
    const usersResponse = await api.get('/users');
    const users= usersResponse.data;

    //Tìm id lớn nhất
    const maxId = users.reduce((max: number, user: User) => {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      return userId > max ? userId : max;
    }, 0);

    const newUser = {
      id: String(maxId+1),
      ...userData,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      role: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return api.post('/users', newUser);
  },

  // Kiểm tra email có tồn tại kh
  checkEmailExists: (email: string) =>
    api.get(`/users?email=${email}`),

  // Lấy thông tin user theo ID
  getUserById: (id: string) =>
    api.get(`/users/${id}`),
};


export default api;

