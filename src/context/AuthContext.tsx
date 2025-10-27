import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi, type StudentRegisterData, type LecturerRegisterData } from '../pages/api'; 
import axios from 'axios';

// ----------------------------------------------------------------------
// IMPORT TỪ FILE authUtils.ts:
import { UserRole, type User, normalizeRole } from './authUtils'; 
// ----------------------------------------------------------------------
// IMPORT React Query:
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
// ----------------------------------------------------------------------

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean; // Trạng thái này sẽ lấy từ useQuery
    isStudent: boolean;
    isLecturer: boolean;
    login: (email: string, password: string) =>Promise<{success: boolean, message: string}>;
    register: (
            role: 'student' | 'lecturer', 
            data: StudentRegisterData | LecturerRegisterData
    ) => Promise<{success: boolean, message: string}>;    
    logout: ()=> void;
}

const AuthContext = createContext<AuthContextType | undefined> (undefined);

export const AuthProvider = ({ children }: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const queryClient = useQueryClient(); // Khởi tạo Query Client

    // Hàm tiện ích để chuẩn hóa và set User
    const normalizeAndSetUser = (userData: any) => {
        const normalized: User = { 
            id: String(userData.id),
            email: userData.email,
            full_name: userData.full_name || userData.fullName,
            // Đã cập nhật fallback avatar để tránh lỗi random
            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.email || 'random'}`, 
            role: normalizeRole(userData.role),
            phone: userData.phone,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
        };
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
    };

    // Hàm logout cục bộ (xử lý state và localStorage)
    const logoutLocally = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Vô hiệu hóa và xóa cache của user hiện tại
        queryClient.invalidateQueries({ queryKey: ['currentUser'] }); 
    }

    // ================================================================
    // 1. Dùng useQuery để kiểm tra trạng thái đăng nhập khi khởi động
    // ================================================================
    const { 
        isLoading: isAuthLoading, // Tên mới để tránh trùng với context
    } = useQuery({
        queryKey: ['currentUser'], 
        queryFn: async () => {
            const savedToken = localStorage.getItem('token');
            if (!savedToken) {
                // Throw error nếu không có token để useQuery coi là fail
                throw new Error("No token found"); 
            }
            return authApi.getCurrentUser();
        },
        // Chỉ chạy query nếu token tồn tại
        enabled: !!localStorage.getItem('token'), 
        refetchOnWindowFocus: false,
        onSuccess: (response) => {
            if (response.data) {
                normalizeAndSetUser(response.data);
            } else {
                logoutLocally();
            }
        },
        onError: (error) => {
            console.error("Auth check failed:", error);
            logoutLocally();
        },
        // Cài đặt này giúp nó chỉ chạy một lần duy nhất khi khởi động
        staleTime: Infinity, 
        cacheTime: 0,
    });

    // ================================================================
    // 2. Dùng useMutation cho Login
    // ================================================================
    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string, password: string }) => {
            return authApi.login(email, password);
        },
        onSuccess: (response) => {
            if (response.data) {
                const { user: userData, token } = response.data;
                
                localStorage.setItem('token', token);
                normalizeAndSetUser(userData);

                // Đồng bộ hóa trạng thái User bằng cách re-fetch/invalidate query
                queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            }
        },
        // Xử lý lỗi trong hàm `login` để trả về message thân thiện
    });

    const login = async (email: string, password: string) => { 
        try {
            await loginMutation.mutateAsync({ email, password });
            return {success: true, message: "Đăng nhập thành công!"};
        } catch(error: unknown) {
               if (import.meta.env.DEV) console.error('Login error', error);
               if (axios.isAxiosError(error)) { 
                    if (error.response?.status === 401) {
                        return { success: false, message: "Email hoặc mật khẩu không đúng!" };
                    }
                    const message =
                        (error.response?.data as any)?.message ??
                        "Có lỗi xảy ra khi đăng nhập!";
                    return { success: false, message };
                }
                return { success: false, message: "Có lỗi xảy ra khi đăng nhập!" };
            }
    };

    // ================================================================
    // 3. Dùng useMutation cho Register
    // ================================================================
    const registerMutation = useMutation({
        mutationFn: async ({ role, data }: { role: 'student' | 'lecturer', data: StudentRegisterData | LecturerRegisterData }) => {
            const { confirmPassword, enrollmentYear, title: rawTitle, className, major, studentCode, lecturerCode, department, bio, ...commonData } = data as any; 

            if (role === 'student') {
                const studentData: StudentRegisterData = {
                    ...commonData, 
                    studentCode,
                    major,
                    className,
                    enrollmentYear: enrollmentYear ? Number(enrollmentYear) : undefined 
                };
                return authApi.registerStudent(studentData); 
            } 
            
            const lecturerData: LecturerRegisterData = {
                ...commonData, 
                lecturerCode,
                department,
                // Title được parse từ form.
                title: rawTitle, 
                bio,
            };
            return authApi.registerLecturer(lecturerData);
        },
        onSuccess: (response) => {
            if(response.data) {
                const { user: userData, token } = response.data;
                
                localStorage.setItem('token', token);
                normalizeAndSetUser(userData);

                // Đồng bộ hóa trạng thái User
                queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            }
        },
        // Xử lý lỗi trong hàm `register` bên dưới
    });

    const register = async (
        role: 'student' | 'lecturer',
        data: StudentRegisterData | LecturerRegisterData 
    ) => {
        try {
            await registerMutation.mutateAsync({ role, data });
            return {success: true, message: "Đăng ký thành công!"};
        } catch(error: any) {
            console.error('Register error:', error.response?.data);
            
            const message = error.response?.data?.message || 
                            error.response?.data?.error ||
                            "Có lỗi xảy ra khi đăng ký!";
            
            return {success: false, message}; 
        }
    };

    // ================================================================
    // 4. Hàm Logout
    // ================================================================
    const logout = () => { 
        logoutLocally();
    };

    const isLoading = isAuthLoading;

    return (
        <AuthContext.Provider value = {{
            user,
            isAuthenticated: !!user, 
            isLoading, // Dùng trạng thái isLoading từ useQuery
            isStudent: user?.role === UserRole.STUDENT,
            isLecturer: user?.role === UserRole.LECTURER,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => { 
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used with an AuthProvider');
    }
    return context;
}