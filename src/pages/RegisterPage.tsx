import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // student
    studentCode: '',
    major: '',
    enrollmentYear: '',
    className: '',
    // lecturer
    lecturerCode: '',
    department: '',
    title: 'LECTURER',
    bio: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore(state => state.register);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { // Xử lý thay đổi form
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // --- Client-side validation ---
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự!');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setIsLoading(false);
      return;
    }
    // --- End validation ---

    // Loại bỏ confirmPassword trước khi gửi API
    const { confirmPassword, ...data } = formData;
    
    // Logic mới: Gọi register và kiểm tra kết quả trả về
    try {
        const result = await register(role, data); // Gọi hàm register

        if (result.success) {
            alert('Đăng ký thành công!');
            navigate('/'); // Chuyển hướng về trang chủ sau khi đăng ký thành công và đã login
        } else {
            setError(result.message); // Hiển thị lỗi từ API trả về
        }
    } catch (err) {
        // Lỗi này chỉ bắt các lỗi không liên quan đến API (rất hiếm)
        console.error('Unexpected register error:', err);
        setError('Đã xảy ra lỗi không mong muốn trong quá trình đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-lg w-full bg-surface rounded-2xl shadow-2xl overflow-hidden my-4 border border-color/50 relative z-10 backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl">
        {/* Logo Header */}
        <div className="bg-primary px-8 py-6 relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine"></div>
          
          <div className="flex items-center justify-center gap-3 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="text-primary" viewBox="0 0 24 24">
              <path d="M17.5 4.5c-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-1.45-1.1-3.55-1.5-5.5-1.5zM21 18.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
            </svg>
            <h1 className="text-3xl font-bold text-primary">SkillUp</h1>
          </div>
        </div>

        <div className="px-8 py-6 max-h-[calc(100vh-160px)] overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-main mb-2">Đăng ký tài khoản</h2>
            <p className="text-secondary text-sm">
              Tạo tài khoản mới để bắt đầu học tập
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex justify-center mb-6 gap-3">
            <button
              type="button"
              className={`px-6 py-2.5 rounded-lg font-medium transition-all relative overflow-hidden group ${
                role === 'student'
                  ? 'bg-primary text-primary shadow-lg scale-105'
                  : 'bg-component text-main hover:bg-opacity-80 hover:scale-105'
              }`}
              onClick={() => setRole('student')}
            >
              <span className="relative z-10">
                Sinh viên
              </span>
              {role === 'student' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
            </button>
            <button
              type="button"
              className={`px-6 py-2.5 rounded-lg font-medium transition-all relative overflow-hidden group ${
                role === 'lecturer'
                  ? 'bg-primary text-primary shadow-lg scale-105'
                  : 'bg-component text-main hover:bg-opacity-80 hover:scale-105'
              }`}
              onClick={() => setRole('lecturer')}
            >
              <span className="relative z-10">
                Giảng viên
              </span>
              {role === 'lecturer' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-background border-2 border-primary rounded-lg text-main text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* Conditional Fields */}
          {role === 'student' && (
            <>
              <Input label="Mã sinh viên" name="studentCode" value={formData.studentCode} onChange={handleChange} required />
              <Input label="Ngành học" name="major" value={formData.major} onChange={handleChange} />
              <Input label="Năm nhập học" name="enrollmentYear" type="number" value={formData.enrollmentYear} onChange={handleChange} />
              <Input label="Lớp" name="className" value={formData.className} onChange={handleChange} />
            </>
          )}

          {role === 'lecturer' && (
            <>
              <Input label="Mã giảng viên" name="lecturerCode" value={formData.lecturerCode} onChange={handleChange} required />
              <Input label="Khoa / Bộ môn" name="department" value={formData.department} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Chức danh
                </label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-main transition-all"
                >
                  <option value="TA">Trợ giảng</option>
                  <option value="LECTURER">Giảng viên</option>
                  <option value="SENIOR_LECTURER">Giảng viên chính</option>
                  <option value="ASSOCIATE_PROFESSOR">Phó giáo sư</option>
                  <option value="PROFESSOR">Giáo sư</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Giới thiệu bản thân
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Chuyên gia về lập trình..."
                  className="w-full px-4 py-2.5 bg-background border border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-main placeholder:text-secondary transition-all resize-none"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary font-semibold py-3 px-4 rounded-lg hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-2 relative overflow-hidden group"
          >
            <span className="relative z-10">{isLoading ? 'Đang xử lý...' : 'Đăng ký'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center pb-2">
          <p className="text-sm text-secondary">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-main hover:underline font-semibold"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

/** Input component */
function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-main mb-2"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 bg-background border border-color rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-main placeholder:text-secondary transition-all"
      />
    </div>
  );
}