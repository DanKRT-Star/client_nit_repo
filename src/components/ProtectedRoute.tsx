import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute ({children}: ProtectedRouteProps) {
    const user = useAuthStore(state => state.user);
    const isAuthenticated = !!user;
    const isLoading = useAuthStore(state => state.isLoading);

    const location = useLocation();


    //Hiển thị loading screen
    if(isLoading){
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Chưa đăng nhập, redirect về login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace/>
    }

    //Đã đăng nhập thì hiển thị nội dung
    return <>{children}</>
}