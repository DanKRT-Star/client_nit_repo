import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

export default function LoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy redirect path từ state (nếu user bị redirect từ protected route)
    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        //Validation
        if(!email || !password){
            setError('Vui lòng điền đầy đủ thông tin!');
            setIsLoading(false);
            return;
        }

        try {
            const result = await login(email, password);

            if(result.success){
                // Redirect về trang trước đó hoặc trang chủ
                navigate(from, {replace: true});
            } else {
                setError(result.message);
            }
        } catch(err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="min-h-scren flex items-center justify-center bg-gradient-to-br from-blue-50 to-indogo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                {/* Header */}
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 dark:text-white- mb-2'>
                        Đăng nhập
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400'>
                        Chào mừng bạn trở lại!
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md'>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            Email
                        </label>
                        <input 
                            type="email"
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-s-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                            placeholder='example@gmail.com'
                            disabled={isLoading}
                         />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                            Mật khẩu
                        </label>
                        <input
                            id='password' 
                            type="password"
                            value={password}
                            onChange = {(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder='********'
                            disabled={isLoading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
                {/* Quick Login Info */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                        Tài khoản demo:
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Student: student@example.com / student123
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mentor: mentor@example.com / mentor123
                    </p>
                </div>
                {/* Register Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Chưa có tài khoản?{' '}
                        <Link
                        to="/register"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                        Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}