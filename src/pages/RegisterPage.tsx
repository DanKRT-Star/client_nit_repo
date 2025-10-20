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

        //Validation
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8'>
                {/* Header */}
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                        Đăng ký
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400'>
                        Tạo tài khoản mới để bắt đầu học tập
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm'>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* Full Name */}
                    <div>
                        <label htmlFor="full_name" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            Họ và tên <span className='text-red-500'>*</span>
                        </label>
                        <input 
                            id="full_name"
                            name = "full_name"
                            type="text"
                            value={formData.full_name}
                            onChange = {handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder='Nguyễn Văn A'
                            disabled = {isLoading}
                             />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email <span className='text-red-500'>*</span>
                        </label>
                        <input 
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            placeholder='example@gmail.com'
                            disabled={isLoading}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Số điện thoại
                        </label>
                        <input 
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                            placeholder='0123456789'
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mật khẩu <span className='text-red-500'>*</span>
                        </label>
                        <input 
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder='********'
                            disabled={isLoading}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            Xác nhận mật khẩu <span className='text-red-500'>*</span>
                        </label>
                        <input
                            id='confirmPassword'
                            name='confirmPassword'
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="••••••••"
                            disabled={isLoading}
                            />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Đã có tài khoản?{' '}
                        <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                        Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};