import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type StudentRegisterData, type LecturerRegisterData } from '../pages/api';
import { useAuthStore } from '../stores/authStore';
import { queryKeys } from '../config/queryClient';
import { type User, normalizeRole } from '../util/authUtils';

// Hook get current user
export const useCurrentUser = () => {
  const setUser = useAuthStore(state => state.setUser);
  
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      if (response.data) {
        const normalized: User = {
          id: String(response.data.id),
          email: response.data.email,
          full_name: response.data.fullName || response.data.full_name || '',
          avatar: response.data.avatar || `https://i.pravatar.cc/150?u=${response.data.email}`,
          role: normalizeRole(response.data.role),
          phone: response.data.phone,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt
        };
        setUser(normalized);
        return normalized;
      }
      return null;
    },
    enabled: !!localStorage.getItem('token'), // Chỉ fetch khi có token
    retry: false,
  });
};

// Hook login
export const useLogin = () => {
  const setUser = useAuthStore(state => state.setUser);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authApi.login(email, password);
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        const { user, token } = data;
        
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
        
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
        localStorage.setItem('token', token);
        
        // Invalidate và refetch current user
        queryClient.setQueryData(queryKeys.auth.currentUser, normalized);
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
    }
  });
};

// Hook logout
export const useLogout = () => {
  const logout = useAuthStore(state => state.logout);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Nếu có API logout thì gọi ở đây
      // await authApi.logout();
    },
    onSuccess: () => {
      logout();
      // Clear tất cả cache
      queryClient.clear();
    }
  });
};

// Hook register Student
export const useRegisterStudent = () => {
  const setUser = useAuthStore(state => state.setUser);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: StudentRegisterData) => {
      const response = await authApi.registerStudent(data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        const { user, token } = data;
        
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
        
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
        localStorage.setItem('token', token);
        
        queryClient.setQueryData(queryKeys.auth.currentUser, normalized);
      }
    }
  });
};

// Hook register Lecturer
export const useRegisterLecturer = () => {
  const setUser = useAuthStore(state => state.setUser);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LecturerRegisterData) => {
      const response = await authApi.registerLecturer(data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        const { user, token } = data;
        
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
        
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
        localStorage.setItem('token', token);
        
        queryClient.setQueryData(queryKeys.auth.currentUser, normalized);
      }
    }
  });
};

// Hook check email exists
export const useCheckEmailExists = (email: string) => {
  return useQuery({
    queryKey: queryKeys.auth.checkEmail(email),
    queryFn: async () => {
      const response = await authApi.checkEmailExists(email);
      return response.data;
    },
    enabled: !!email && email.includes('@'), // Chỉ check khi có email hợp lệ
    retry: false,
  });
};