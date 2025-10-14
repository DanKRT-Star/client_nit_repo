import axios from 'axios';

const API_URL = 'http://localhost:3002';

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

export default api;

