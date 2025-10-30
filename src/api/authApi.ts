import { authApi, type StudentRegisterData, type LecturerRegisterData } from './api';
import { type User, normalizeRole } from '../util/authUtils';




// === LOGIN ===
export const loginService = async (email: string, password: string) => {
  const res = await authApi.login(email, password);
  const { user, token } = res.data;

  const normalized: User = {
    id: String(user.id),
    email: user.email,
    full_name: user.fullName || user.full_name || '',
    avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
    role: normalizeRole(user.role),
    phone: user.phone,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));

  return normalized;
};

// === LOGOUT ===
export const logoutService = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Nếu có API logout thì gọi ở đây
  // await authApi.logout();
};

// === GET CURRENT USER ===
export const getCurrentUserService = async () => {
  const res = await authApi.getCurrentUser();
  const user = res.data;

  const normalized: User = {
    id: String(user.id),
    email: user.email,
    full_name: user.fullName || user.full_name || '',
    avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
    role: normalizeRole(user.role),
    phone: user.phone,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt
  };

  return normalized;
};

// === REGISTER ===
export const registerService = async (
  role: 'student' | 'lecturer',
  data: StudentRegisterData | LecturerRegisterData
) => {
  let res;
  if (role === 'student') {
    res = await authApi.registerStudent(data as StudentRegisterData);
  } else {
    res = await authApi.registerLecturer(data as LecturerRegisterData);
  }

  const { user, token } = res.data;

  const normalized: User = {
    id: String(user.id),
    email: user.email,
    full_name: user.fullName || user.full_name || '',
    avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
    role: normalizeRole(user.role),
    phone: user.phone,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));

  return normalized;
};