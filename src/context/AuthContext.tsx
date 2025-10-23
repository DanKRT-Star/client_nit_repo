import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type StudentRegisterData, type LecturerRegisterData } from '../pages/api'; 
import axios from 'axios';

// ----------------------------------------------------------------------
// IMPORT TỪ FILE MỚI:
import { UserRole, type User, normalizeRole } from './authUtils'; 
// ----------------------------------------------------------------------

// ĐÃ BỎ UserRole, User, normalizeRole khỏi file này

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
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
    const [isLoading, setIsLoading] = useState(true);

    // ĐÃ BỎ normalizeRole khỏi đây

    //Kiểm tra user đã đăng nhập chưa khi load app
    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('token'); 

            if(savedToken) {
                try {
                    const response = await authApi.getCurrentUser();
                    if(response.data) {
                        const userData = response.data;
                        const normalized: User = { 
                            id: String(userData.id),
                            email: userData.email,
                            full_name: userData.full_name,
                            // Gọi normalizeRole đã được import
                            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.id}`,
                            role: normalizeRole(userData.role), 
                            phone: userData.phone,
                            createdAt: userData.createdAt,
                            updatedAt: userData.updatedAt,
                        };
                        setUser(normalized);
                        localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
                    }
                    else {
                        localStorage.removeItem('token');
                    }
                }catch(error){
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                }
            }
            localStorage.removeItem('user'); 
            setIsLoading(false);
        };
        checkAuth();
    }, []); // Cảnh báo ESLint đã được xử lý (không cần thêm normalizeRole vào deps)

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
                
                setUser(normalized);
                localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
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

    const register = async (
        role: 'student' | 'lecturer',
        data: StudentRegisterData | LecturerRegisterData 
    ) => {
        try {
            let response;
            const { confirmPassword, enrollmentYear, title: rawTitle, className, major, studentCode, lecturerCode, department, bio, ...commonData } = data as any; 

            if (role === 'student') {
                const studentData: StudentRegisterData = {
                    ...commonData, 
                    studentCode,
                    major,
                    className,
                    enrollmentYear: enrollmentYear ? Number(enrollmentYear) : undefined 
                };
                response = await authApi.registerStudent(studentData); 
            } else { 
                const lecturerData: LecturerRegisterData = {
                    ...commonData, 
                    lecturerCode,
                    department,
                    title: rawTitle,
                    bio,
                };
                response = await authApi.registerLecturer(lecturerData); 
            }

            console.log(`✅ Register ${role} response:`, response.data);

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
                localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
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