import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api, { authApi } from '../pages/api';
import axios from 'axios';

export const UserRole = {
  STUDENT: 1,
  LECTURER: 2
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

interface User {
    id: string;
    email: string;
    full_name: string;
    avatar: string;
    role: typeof UserRole.STUDENT | typeof UserRole.LECTURER;
    phone?: string;
    createdAt: string;
    updatedAt?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isStudent: boolean;
    isLecturer: boolean;
    login: (email: string, password: string) =>Promise<{success: boolean, message: string}>;
    register: (data: {email: string; password: string; full_name: string; phone?: string}) => Promise<{success: boolean, message: string}>;
    logout: ()=> void;
}

const AuthContext = createContext<AuthContextType | undefined> (undefined);

export const AuthProvider = ({ children }: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    type ApiRole = string | number | null | undefined;
    const normalizeRole = (apiRole: ApiRole): UserRole => {
        // API có thể trả về: "LECTURER", "lecturer", 2, "2"
        if (
            apiRole === 2 || 
            apiRole === '2' || 
            apiRole === 'LECTURER' || 
            apiRole === 'lecturer' ||
            (typeof apiRole === 'string' && apiRole.toUpperCase() === 'LECTURER')
        ) {
            return UserRole.LECTURER;
        }
        return UserRole.STUDENT;
    };

    //Kiểm tra user đã đăng nhập chưa khi load app
    useEffect(() => {
        const checkAuth = async () => {
            const savedUser = localStorage.getItem('user');
            const savedToken = localStorage.getItem('token');

            if(savedUser && savedToken) {
                try {
                    const parsed = JSON.parse(savedUser);
                    // Verify: token phải khớp user.id
                    if(String(savedToken) !== String(parsed?.id)) {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        setIsLoading(false);
                        return;
                    }
                    // Gọi API /auth/me để lấy user hiện tại
                    const response = await authApi.getCurrentUser();
                    if(response.data) {
                        const userData = response.data;
                        const normalized: User = {
                            id: String(userData.id),
                            email: userData.email,
                            full_name: userData.full_name,
                            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${Math.floor(Math.random())}`,
                            role: normalizeRole(userData.role),
                            phone: userData.phone,
                            createdAt: userData.createdAt,
                            updatedAt: userData.updatedAt,
                        };
                        setUser(normalized);
                    }
                    else {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                    }
                }catch(error){
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);
            
            if(import.meta.env.DEV) console.debug('Login response', response.data);
            
            if(response.data) {
                const { user: userData, token } = response.data;
                
                const normalized: User = {
                    id: String(userData.id),
                    email: userData.email,
                    full_name: userData.full_name,
                    avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.email}`,
                    role: normalizeRole(userData.role),
                    phone: userData.phone,
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt
                };
                
                if(import.meta.env.DEV){
                    console.debug('Normalized role:', normalized.role);
                    console.debug('Is Lecturer:', normalized.role === UserRole.LECTURER);
                }
                
                setUser(normalized);
                localStorage.setItem('user', JSON.stringify(normalized));
                localStorage.setItem('token', token);
                
                return {success: true, message: "Đăng nhập thành công!"};
            }
            return {success: false, message: "Đăng nhập thất bại!"};
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

    const register = async (data: { email: string; password: string; full_name: string; phone?: string}) => {
        try {
            // Không cần check email exists nữa, để API backend xử lý
            const response = await authApi.register(data);

            console.log('✅ Register response:', response.data);

            if(response.data) {
                const { user: userData, token } = response.data;
                
                const normalized: User = {
                    id: String(userData.id),
                    email: userData.email,
                    full_name: userData.full_name,
                    avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.email}`,
                    role: normalizeRole(userData.role),
                    phone: userData.phone,
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt
                };

                setUser(normalized);
                localStorage.setItem('user', JSON.stringify(normalized));
                localStorage.setItem('token', token);

                return {success: true, message: "Đăng ký thành công!"};
            }
            return {success: false, message: "Đăng ký thất bại!"};
        } catch(error: any) {
            console.error('Register error:', error.response?.data);
            
            const message = error.response?.data?.message || 
                           error.response?.data?.error ||
                           "Có lỗi xảy ra khi đăng ký!";
            
            return {success: false, message};
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value = {{
            user,
            isAuthenticated: !!user,
            isLoading,
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
