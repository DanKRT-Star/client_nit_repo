import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useAuthQuery';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  // 🔍 DEBUG: Kiểm tra token khi component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 LOGIN PAGE - Initial check:');
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'NULL');
    console.log('User:', user);
    
    // Nếu đã có token, redirect về trang chủ
    if (token) {
      console.log('✅ Already logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    console.log('📝 Submitting login form:', { email: data.email });
    
    try {
      const user = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      console.log('✅ Login successful!');
      console.log('User:', user);
      
      // 🔍 DEBUG: Kiểm tra token sau khi login
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('💾 Saved to localStorage:');
      console.log('Token:', savedToken ? `${savedToken.substring(0, 20)}...` : 'NULL');
      console.log('User:', savedUser);

      if (!savedToken) {
        console.error('❌ ERROR: Token not saved to localStorage!');
        toast.error('Lỗi lưu token, vui lòng thử lại');
        return;
      }

      toast.success('Đăng nhập thành công!');
      
      // Delay nhỏ để đảm bảo token đã được lưu
      setTimeout(() => {
        console.log('🔄 Redirecting to:', from);
        navigate(from, { replace: true });
      }, 100);

    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Response:', error?.response?.data);
      
      const errorMessage =
        error?.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="max-w-md w-full bg-surface rounded-2xl shadow-2xl overflow-hidden border border-color/50 relative z-10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl">
        {/* Logo Header */}
        <div className="bg-primary px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine"></div>

          <div className="flex items-center justify-center gap-3 relative z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              className="text-primary"
              viewBox="0 0 24 24"
            >
              <path d="M17.5 4.5c-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-1.45-1.1-3.55-1.5-5.5-1.5zM21 18.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
            </svg>
            <h1 className="text-3xl font-bold text-primary">SkillUp</h1>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-main mb-2">Đăng nhập</h2>
            <p className="text-secondary text-sm">Chào mừng bạn trở lại!</p>
          </div>

          {loginMutation.isError && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm font-medium">
              ⚠️{' '}
              {(loginMutation.error as any)?.response?.data?.message ||
                'Có lỗi xảy ra!'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-main mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ',
                  },
                })}
                className="w-full px-4 py-2.5 bg-background border border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-main placeholder:text-secondary transition-all"
                placeholder="example@gmail.com"
                disabled={loginMutation.isLoading || isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-main mb-2"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                  },
                })}
                className="w-full px-4 py-2.5 bg-background border border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-main placeholder:text-secondary transition-all"
                placeholder="••••••••"
                disabled={loginMutation.isLoading || isSubmitting}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isLoading || isSubmitting}
              className="w-full bg-primary text-primary font-semibold py-3 px-4 rounded-lg hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loginMutation.isLoading || isSubmitting
                  ? 'Đang đăng nhập...'
                  : 'Đăng nhập'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-background border border-color rounded-lg">
            <p className="text-sm text-main mb-2 font-semibold">
              Tài khoản demo:
            </p>
            <p className="text-xs text-secondary mb-1">
              Student: student@example.com / student123
            </p>
            <p className="text-xs text-secondary">
              Mentor: mentor@example.com / mentor123
            </p>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-main hover:underline font-semibold"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}