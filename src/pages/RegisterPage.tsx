import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password:'',
        confirmPassword: '',
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if(!formData.full_name || !formData.email || !formData.password) {
            setError('Vui lòng nhập đầy đủ thông tin bắt buộc!');
            setIsLoading(false);
            return;
        }

        if(formData.password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự!');
            setIsLoading(false);
            return;
        }

        if(formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            setIsLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;
            const result = await register(registerData);

            if(result.success) {
                navigate('/', {replace: true});
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.log('Register error: ', err)
            setError('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className='max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 relative z-10 animate-fadeIn'>
                {/* Header */}
                <div className='text-center mb-8'>
                    {/* Logo with animation */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-100 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-3 transition-all duration-300 animate-bounce-slow">
                            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" className="dark:fill-gray-900 drop-shadow-lg" viewBox="0 0 24 24">
                                <path d="M17.5 4.5c-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-1.45-1.1-3.55-1.5-5.5-1.5zM21 18.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-2 animate-gradient'>
                        Đăng ký
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 animate-fadeIn animation-delay-200'>
                        Tạo tài khoản mới để bắt đầu học tập 
                    </p>
                </div>

                {/* Error Message with animation */}
                {error && (
                    <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm animate-shake backdrop-blur-sm'>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* Full Name */}
                    <div className="group animate-fadeIn animation-delay-300">
                        <label htmlFor="full_name" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors'>
                            Họ và tên <span className='text-red-500'>*</span>
                        </label>
                        <div className="relative">
                            <input 
                                id="full_name"
                                name = "full_name"
                                type="text"
                                value={formData.full_name}
                                onChange = {handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-gray-900/20 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-white dark:text-white transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder='Nguyễn Văn A'
                                disabled = {isLoading}
                            />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="group animate-fadeIn animation-delay-400">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            Email <span className='text-red-500'>*</span>
                        </label>
                        <div className="relative">
                            <input 
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-gray-900/20 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-white dark:text-white transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                                placeholder='example@gmail.com'
                                disabled={isLoading}
                            />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="group animate-fadeIn animation-delay-500">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            Số điện thoại
                        </label>
                        <div className="relative">
                            <input 
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-gray-900/20 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-white dark:text-white transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                                placeholder='0123456789'
                                disabled={isLoading}
                            />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="group animate-fadeIn animation-delay-600">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            Mật khẩu <span className='text-red-500'>*</span>
                        </label>
                        <div className="relative">
                            <input 
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-gray-900/20 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-white dark:text-white transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder='••••••••'
                                disabled={isLoading}
                            />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="group animate-fadeIn animation-delay-700">
                        <label htmlFor="confirmPassword" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors'>
                            Xác nhận mật khẩu <span className='text-red-500'>*</span>
                        </label>
                        <div className="relative">
                            <input
                                id='confirmPassword'
                                name='confirmPassword'
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-gray-900/20 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-white dark:text-white transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 dark:from-white dark:via-gray-100 dark:to-white dark:hover:from-gray-100 dark:hover:via-gray-200 dark:hover:to-gray-100 text-white dark:text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] animate-fadeIn animation-delay-800 relative overflow-hidden group"
                    >
                        <span className="relative z-10">{isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : 'Đăng ký'}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500"></div>
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center animate-fadeIn animation-delay-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Đã có tài khoản?{' '}
                        <Link
                        to="/login"
                        className="text-gray-900 dark:text-white hover:underline font-semibold relative inline-block group"
                        >
                            <span className="relative z-10">Đăng nhập ngay</span>
                            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 rounded scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }

                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }

                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }

                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                    opacity: 0;
                }

                .animation-delay-300 {
                    animation-delay: 0.3s;
                    opacity: 0;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                    opacity: 0;
                }

                .animation-delay-500 {
                    animation-delay: 0.5s;
                    opacity: 0;
                }

                .animation-delay-600 {
                    animation-delay: 0.6s;
                    opacity: 0;
                }

                .animation-delay-700 {
                    animation-delay: 0.7s;
                    opacity: 0;
                }

                .animation-delay-800 {
                    animation-delay: 0.8s;
                    opacity: 0;
                }

                .animation-delay-900 {
                    animation-delay: 0.9s;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};