import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../pages/api';

export enum UserRole {
  STUDENT = 1,
  MENTOR = 2
}

interface User {
    id: string;
    email: string;
    full_name: string;
    avatar: string;
    role: UserRole;
    phone?: string;
    createdAt: string;
    updatedAt?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isStudent: boolean;
    isMentor:boolean;
    login: (email: string, password: string) =>Promise<{success: boolean, message: string}>;
    register: (data: {email: string; password: string; full_name: string; phone?: string}) => Promise<{success: boolean, message: string}>;
    logout: ()=> void;
}

const AuthContext = createContext<AuthContextType | undefined> (undefined);

export const AuthProvider = ({ children }: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                    // Lấy user mới nhất và chuẩn hóa role
                    const response = await authApi.getUserById(parsed.id);
                    if(response.data){
                        const serverUser = response.data;
                        const normalized = {
                            id: String(serverUser.id),
                            email: serverUser.email,
                            full_name: serverUser.full_name,
                            avatar: serverUser.avatar,
                            role: serverUser.role === 2 || serverUser.role === '2' || serverUser.role === 'mentor'
                            ? UserRole.MENTOR : UserRole.STUDENT,
                            phone: serverUser.phone,
                            createdAt: serverUser.createdAt,
                            updatedAt: serverUser.updatedAt ?? serverUser.createdAt,
                        } as User;
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
            const response= await authApi.login(email, password);

            if(response.data && response.data.length >0) {
                const userData = response.data[0];
                const {password: _, ...userWithoutPassword} = userData;

                setUser(userWithoutPassword);
                localStorage.setItem('user', JSON.stringify(userWithoutPassword));
                localStorage.setItem('token', userData.id);

                return {success: true, message:"Đăng nhập thành công!"};
            } else {
                return {success: false, message:"Đăng nhập thất bại!"}
            }
        } catch(error) {
            console.error('Login error:', error);
            return {success: false, message: "Có lỗi xảy ra khi đăng nhập!"};
        }
    };

    const register = async (data: { email: string; password: string; full_name: string; phone?: string}) => {
        try {
            const checkEmail = await authApi.checkEmailExists(data.email);
            if(checkEmail.data && checkEmail.data.length>0) {
                return { success: false, message: "Email đã được sử dụng!"};
            }

            const response = await authApi.register(data);

            if(response.data) {
                const userData = response.data;
                const { password: _, ...userWithoutPassword } = userData;

                setUser(userWithoutPassword);
                localStorage.setItem('user', JSON.stringify(userWithoutPassword));
                localStorage.setItem('token', userData.id);

                return {success: true, message: "Đăng kí thành công!"};
            } else {
                return {success: false, message: "Đăng kí thất bại!"};
            }
        } catch(error) {
            console.error('Register error: ', error);
            return {success: false, message: "Có lỗi xảy ra khi đăng kí!"};
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
            isMentor: user?.role === UserRole.MENTOR,
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
