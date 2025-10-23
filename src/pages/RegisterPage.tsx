import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Types cho form data để đảm bảo type safety
import { type StudentRegisterData, type LecturerRegisterData } from '../pages/api';

// Tạo Union Type cho Form Data, bao gồm cả các trường không gửi lên API (confirmPassword)
type RegisterFormData = (StudentRegisterData & {
  confirmPassword: string;
}) | (LecturerRegisterData & {
  confirmPassword: string;
});

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
  const { register } = useAuth(); // Sử dụng useAuth hook
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

  return ( // JSX giữ nguyên
    <div className="h-full  flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="h-full overflow-auto max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Đăng ký tài khoản</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tạo tài khoản mới để bắt đầu học tập
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex justify-center mb-6 gap-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-md font-medium transition ${
              role === 'student'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => setRole('student')}
          >
            Sinh viên
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md font-medium transition ${
              role === 'lecturer'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => setRole('lecturer')}
          >
            Giảng viên
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chức danh
                </label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="TA">Trợ giảng</option>
                  <option value="LECTURER">Giảng viên</option>
                  <option value="SENIOR_LECTURER">Giảng viên chính</option>
                  <option value="ASSOCIATE_PROFESSOR">Phó giáo sư</option>
                  <option value="PROFESSOR">Giáo sư</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Giới thiệu bản thân
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Chuyên gia về lập trình..."
                  className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        {/* Login link */}
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
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
    </div>
  );
}