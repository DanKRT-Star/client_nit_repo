import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type StudentRegisterData, type LecturerRegisterData } from '../pages/api'; // Thêm StudentRegisterData, LecturerRegisterData
import axios from 'axios';

export const UserRole = {
  STUDENT: 1,
  LECTURER: 2
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole]; // Định nghĩa UserRole type

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

    type ApiRole = string | number | null | undefined;
    const normalizeRole = (apiRole: ApiRole): UserRole => { 
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
            const savedToken = localStorage.getItem('token'); // Chỉ cần kiểm tra token

            if(savedToken) {
                try {
                    // Gọi API /auth/me để lấy user hiện tại, sử dụng token đã lưu
                    const response = await authApi.getCurrentUser();
                    if(response.data) {
                        const userData = response.data;
                        const normalized: User = { // Chuẩn hóa dữ liệu user
                            id: String(userData.id),
                            email: userData.email,
                            full_name: userData.full_name,
                            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.id}`, // Dùng ID thay vì Random
                            role: normalizeRole(userData.role),
                            phone: userData.phone,
                            createdAt: userData.createdAt,
                            updatedAt: userData.updatedAt,
                        };
                        setUser(normalized);
                        // Cập nhật localStorage: chỉ lưu user data, không lưu token vào user object
                        localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
                    }
                    else {
                        // Token có nhưng API /me không thành công, xóa token
                        localStorage.removeItem('token');
                    }
                }catch(error){
                    // Lỗi API (token hết hạn,...)
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                }
            }
            // Loại bỏ logic kiểm tra savedUser & savedToken khớp nhau (token không nên là user.id)
            localStorage.removeItem('user'); // Xóa savedUser cũ nếu có
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => { // Xử lý login
        try {
            const response = await authApi.login(email, password);
            
            if(import.meta.env.DEV) console.debug('Login response', response.data);
            
            if(response.data) {
                const { user: userData, token } = response.data;
                
                const normalized: User = { // Chuẩn hóa user data
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
                // CHỈ lưu token và một phần user data (id, role)
                localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
                localStorage.setItem('token', token);
                
                return {success: true, message: "Đăng nhập thành công!"};
            }
            return {success: false, message: "Đăng nhập thất bại!"};
        } catch(error: unknown) {
               if (import.meta.env.DEV) console.error('Login error', error);
               if (axios.isAxiosError(error)) { // Xử lý lỗi Axios
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
        data: StudentRegisterData | LecturerRegisterData // Type Safety đã được cải thiện
    ) => {
        try {
            let response;
            // Tách các trường không cần thiết cho API (confirmPassword đã được loại bỏ ở RegisterPage)
            const { confirmPassword, enrollmentYear, title: rawTitle, className, major, studentCode, lecturerCode, department, bio, ...commonData } = data as any; 

            if (role === 'student') {
                const studentData: StudentRegisterData = {
                    ...commonData, 
                    studentCode,
                    major,
                    className,
                    enrollmentYear: enrollmentYear ? Number(enrollmentYear) : undefined 
                };
                response = await authApi.registerStudent(studentData); // Gọi API registerStudent
            } else { // role === 'lecturer'
                const lecturerData: LecturerRegisterData = {
                    ...commonData, 
                    lecturerCode,
                    department,
                    title: rawTitle,
                    bio,
                };
                response = await authApi.registerLecturer(lecturerData); // Gọi API registerLecturer
            }

            console.log(`✅ Register ${role} response:`, response.data);

            if(response.data) {
                const { user: userData, token } = response.data;
                
                const normalized: User = { // Chuẩn hóa user data
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
                // CHỈ lưu token và một phần user data
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
            
            return {success: false, message}; // Bắt lỗi và trả về object thay vì throw
        }
    };

    const logout = () => { // Xử lý logout
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value = {{
            user,
            isAuthenticated: !!user, // Giá trị dẫn xuất
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


export const useAuth = () => { // Custom hook useAuth
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used with an AuthProvider');
    }
    return context;
}