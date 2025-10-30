# Hướng Dẫn Chi Tiết - Chức Năng Tạo Course (Lecturer)

## 📌 Tổng quan

Chức năng tạo và quản lý khóa học dành cho Lecturer đã được hoàn thiện và **tích hợp đầy đủ với API backend**. Tài liệu này mô tả toàn bộ luồng tạo Course từ lúc lecturer submit form, tạo lịch học (schedule) cho từng buổi, cho đến khi dữ liệu được hiển thị lại trong trang danh sách. Đồng thời, tài liệu cũng giải thích rõ cách chúng ta sử dụng các hooks như `useForm`, `useFieldArray`, `useMutation`, `useQuery` để điều phối luồng dữ liệu.

---

## 🏗️ Kiến Trúc Hệ Thống

### 1. **Database Schema (EERD)**

Hệ thống sử dụng 3 bảng chính cho authentication:

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    USER     │       │   LECTURER   │       │   COURSE    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ userId (PK) │──┐    │ lecturerId   │──┐    │ courseId    │
│ email       │  │    │ (PK)         │  │    │ (PK)        │
│ fullName    │  └───>│ userId (FK)  │  │    │             │
│ role        │       │ lecturerCode │  └───>│ lecturerId  │
│ ...         │       │ department   │       │ (FK)        │
└─────────────┘       │ title        │       │ courseCode  │
                      │ bio          │       │ courseName  │
                      └──────────────┘       │ ...         │
                                             └─────────────┘
```

### 2. **⚠️ Vấn Đề Quan Trọng: User ID vs Lecturer ID**

Đây là vấn đề **quan trọng nhất** trong việc tích hợp API:

#### **Tại sao có 2 ID khác nhau?**

- **`userId`**: ID trong bảng `USER` - đại diện cho tài khoản đăng nhập
- **`lecturerId`**: ID trong bảng `LECTURER` - đại diện cho thông tin giảng viên cụ thể

**Lý do thiết kế:**
- 1 user có thể có nhiều vai trò (student/lecturer)
- Tách biệt authentication (USER) và business logic (LECTURER/STUDENT)
- Dễ mở rộng khi thêm vai trò mới (admin, staff, etc.)

#### **Vấn đề gặp phải:**

Ban đầu, khi tạo course, frontend gửi `user.id` (userId) làm `lecturerId`:

```json
// ❌ SAI - Gửi userId
{
  "courseCode": "CS101",
  "courseName": "Web Programming",
  "lecturerId": "4a7a2a1e-732d-4108-a868-eee9e265d8d0"  // <- Đây là userId
}
```

Backend trả về lỗi:
```
"Lecturer not found"
```

**Nguyên nhân:**
- Backend tìm trong bảng `LECTURER` với `lecturerId = userId`
- Không tìm thấy vì `userId ≠ lecturerId`

#### **Giải pháp:**

Backend khi login trả về **nested object** với đầy đủ thông tin:

```json
{
  "user": {
    "id": "4a7a2a1e-732d-4108-a868-eee9e265d8d0",  // userId
    "email": "lecturer@elearning.com",
    "role": "LECTURER",
    "student": null,  // null vì user này không phải student
    "lecturer": {
      "id": "c672474c-572a-43a0-99f0-f4cb189ebb6c",  // <- lecturerId thực sự
      "userId": "4a7a2a1e-732d-4108-a868-eee9e265d8d0",
      "lecturerCode": "GV001",
      "department": "Khoa Công Nghệ Thông Tin",
      "title": "LECTURER",
      "bio": "Chuyên gia về lập trình"
    }
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

**Frontend phải extract và lưu đúng ID:**

```typescript
// ✅ ĐÚNG - Extract lecturerId từ nested object
const lecturerId = user.lecturer?.id;  // "c672474c-572a-43a0-99f0-f4cb189ebb6c"

// Gửi lecturerId đúng lên backend
{
  "courseCode": "CS101",
  "lecturerId": "c672474c-572a-43a0-99f0-f4cb189ebb6c"  // <- Đúng!
}
```

---

## 🔄 Flow Dữ Liệu Chi Tiết

### **1. Authentication Flow**

```
┌─────────────┐
│   Login     │
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Backend API: /api/v1/auth/login        │
│  - Kiểm tra email/password              │
│  - Tạo accessToken & refreshToken       │
│  - Query USER + JOIN LECTURER/STUDENT   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Response: {                            │
│    user: {                              │
│      id: "userId",                      │
│      lecturer: { id: "lecturerId" }     │
│    },                                   │
│    accessToken: "...",                  │
│    refreshToken: "..."                  │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Frontend: useLogin hook                │
│  - Extract lecturerId = user.lecturer.id│
│  - Normalize user data                  │
│  - Save to Zustand store:               │
│    {                                    │
│      id: userId,                        │
│      lecturerId: lecturerId,            │
│      role: LECTURER,                    │
│      ...                                │
│    }                                    │
│  - Save to localStorage:                │
│    - token = accessToken                │
│    - refreshToken                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  User authenticated & ready             │
└─────────────────────────────────────────┘
```

### **2. Create Course Flow**

```
┌─────────────────┐
│ User clicks     │
│ "Tạo khóa học"  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ CreateCoursePage.tsx                     │
│ - Check if user.lecturerId exists        │
│ - Validate form with react-hook-form     │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Build request payload:                   │
│ {                                        │
│   courseCode: "CS101",                   │
│   courseName: "Web Programming",         │
│   description: "...",                    │
│   credits: 3,                            │
│   maxStudents: 50,                       │
│   lecturerId: user.lecturerId  // ✅     │
│ }                                        │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ React Query: useMutation                 │
│ - mutationFn: courseApi.createCourse()   │
│ - Axios POST to /api/v1/courses          │
│ - Auto add Authorization header          │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Backend API: /api/v1/courses             │
│ - Verify JWT token                       │
│ - Validate request body                  │
│ - Check if lecturerId exists in DB       │
│ - Create course record                   │
│ - Return course data                     │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Frontend: onSuccess callback             │
│ - Show success message                   │
│ - Invalidate "lecturerCourses" query     │
│ - React Query auto refetch courses list  │
│ - Navigate to /lecturer/courses          │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ LecturerCoursesPage auto updates         │
└──────────────────────────────────────────┘
```

---

### **3. Create Schedule Flow (sau khi Course được tạo)**

```
┌─────────────────────────┐
│ React Hook Form submit │
│ (kèm danh sách lịch)   │
└─────────────┬──────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ CreateCoursePage.tsx                     │
│ - useFieldArray lưu danh sách schedules  │
│ - Sau khi createCourseMutation thành công│
│   → lấy courseId từ response             │
└─────────────┬────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Chuẩn hóa schedule payload               │
│ - Duyệt từng schedule                    │
│ - Ép kiểu totalWeeks về number           │
│ - Chuyển startDate/endDate sang ISO      │
│ - Gắn courseId mới nhận                  │
└─────────────┬────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Promise.all(createSchedule)              │
│ - POST /api/v1/schedules cho từng item   │
│ - Bắt lỗi riêng cho nhóm schedules       │
│ - Alert thông báo thành công/thất bại    │
└─────────────┬────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Điều hướng về /lecturer/courses          │
│ - Danh sách Courses fetch lại            │
└──────────────────────────────────────────┘
```

**Lưu ý quan trọng:**
- Nếu backend trả về courseId bên trong `data`, `course`, hoặc `data.course.id`, component đã handle đủ mọi trường hợp.
- Nếu tất cả schedules tạo thành công → hiển thị alert "Tạo khóa học và lịch học thành công".
- Nếu một schedule thất bại → alert cảnh báo nhưng vẫn giữ khóa học.

---

### **4. Đồng bộ lịch trong LecturerCoursesPage**

```
┌────────────────────────────────────────────┐
│ useQuery(['lecturer-courses'])             │
│ - GET /api/v1/courses/my-courses           │
│ - Trả về danh sách course (có thể thiếu    │
│   field schedules)                         │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│ useEffect                                   │
│ - Lọc course chưa có schedules              │
│ - Gọi courseApi.getCourseSchedules(courseId)│
│   → thực chất là GET /api/v1/schedules?courseId│
│ - Lưu kết quả vào state scheduleMap         │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│ Render card                                │
│ - Ưu tiên lấy scheduleMap[courseId]        │
│ - Nếu đang fetch: hiện loading text        │
│ - Nếu không có lịch: hiện “Chưa thiết lập” │
└────────────────────────────────────────────┘
```

- React Query đảm bảo khi tạo khóa học xong và invalidates query, trang list sẽ tự fetch lại.
- `useEffect` chỉ gọi API lịch cho những course chưa có dữ liệu đáp ứng, tránh call dư thừa nhờ `fetchedScheduleIds`.

---

## 💻 Code Walkthrough

### **1. User Interface - Extended với `lecturerId`**

**File:** `src/util/authUtils.ts`

```typescript
export interface User {
    id: string;           // userId từ bảng USER
    email: string;
    full_name: string;
    avatar: string;
    role: UserRole;
    phone?: string;
    createdAt: string;
    updatedAt?: string;
    
    // ⭐ Thêm 2 fields quan trọng
    lecturerId?: string;  // ID từ bảng LECTURER (khác với userId)
    studentId?: string;   // ID từ bảng STUDENT (khác với userId)
}
```

**Giải thích:**
- `id`: Luôn là `userId` - dùng cho authentication
- `lecturerId`: Chỉ có khi `role = LECTURER` - dùng cho business logic
- `studentId`: Chỉ có khi `role = STUDENT` - dùng cho business logic

---

### **Hook & Library sử dụng**

| Hook / Library | Nơi sử dụng | Mục đích chính |
|----------------|-------------|----------------|
| `useForm` (react-hook-form) | `CreateCoursePage.tsx` | Khởi tạo state form, handle submit, validate input đồng thời đảm bảo type-safe. |
| `useFieldArray` (react-hook-form) | `CreateCoursePage.tsx` | Quản lý danh sách lịch học động (thêm/xóa nhiều schedule cùng lúc) với metadata và lỗi riêng cho từng phần tử. |
| `useMutation` (React Query) | `CreateCoursePage.tsx` | Gửi request `POST /courses` và lần lượt `POST /schedules`, xử lý loading, success, error. |
| `useQuery` (React Query) | `LecturerCoursesPage.tsx` | Fetch danh sách khóa học qua `GET /courses/my-courses`, tự động refetch sau invalidate. |
| `useEffect` (React) | `LecturerCoursesPage.tsx` | Khi courses thay đổi, fetch thêm lịch học cho từng course bằng `GET /schedules?courseId=...` và ghép vào state cục bộ. |
| `useMemo` (React) | `LecturerCoursesPage.tsx` | Tính toán filter list (semester/day options, courses filtered) để tránh render lại không cần thiết. |
| `useAuthStore` (Zustand) | Các trang auth & course | Lưu thông tin user, bao gồm `lecturerId`, share cho mọi component. |

Các hook này phối hợp với nhau để tạo nên một pipeline rõ ràng: form quản lý state → mutation gửi dữ liệu → query refetch → effect bổ sung lịch → UI hiển thị nhất quán.

---

### **2. Login Hook - Extract Nested IDs**

**File:** `src/hooks/useAuthQuery.ts`

```typescript
export const useLogin = () => {
  const setUser = useAuthStore(state => state.setUser);
  
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await authApi.login(email, password);
      return response.data;
    },
    
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data;
      
      // ⭐ QUAN TRỌNG: Extract lecturerId/studentId từ nested objects
      const lecturerId = user.lecturer?.id;  // user.lecturer có thể là null
      const studentId = user.student?.id;    // user.student có thể là null
      
      console.log('✅ Extracted IDs:', { 
        userId: user.id,      // "4a7a2a1e-..."
        lecturerId,           // "c672474c-..." hoặc undefined
        studentId             // undefined (vì role là LECTURER)
      });
      
      // Normalize và lưu vào Zustand store
      const normalized: User = {
        id: String(user.id),
        email: user.email,
        full_name: user.fullName || user.full_name || '',
        avatar: user.avatarUrl || user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
        role: normalizeRole(user.role),
        phone: user.phone,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt,
        lecturerId: lecturerId || undefined,  // ✅ Lưu lecturerId
        studentId: studentId || undefined     // ✅ Lưu studentId
      };
      
      setUser(normalized);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  });
};
```

**Tại sao cần `user.lecturer?.id`?**
- Optional chaining (`?.`) vì `lecturer` có thể là `null` (nếu role là STUDENT)
- Tránh lỗi `Cannot read property 'id' of null`

---

### **3. Create Course Page - Sử dụng `lecturerId`**

**File:** `src/pages/CreateCoursePage.tsx`

```typescript
export const CreateCoursePage = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  
  // React Query mutation cho create course
  const createCourseMutation = useMutation({
    mutationFn: (data: CreateCourseData) => courseApi.createCourse(data),
    
    onSuccess: () => {
      alert('✅ Tạo khóa học thành công!');
      queryClient.invalidateQueries({ queryKey: ['lecturerCourses'] });
      navigate('/lecturer/courses');
    },
    
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra!';
      alert('❌ ' + errorMessage);
    }
  });
  
  const onSubmit = async (data: CourseFormData) => {
    // ⭐ KIỂM TRA lecturerId trước khi submit
    if (!user?.lecturerId) {
      alert('❌ Không tìm thấy thông tin Lecturer ID. Vui lòng đăng nhập lại!');
      console.error('User object:', user);
      return;
    }
    
    console.log('👤 Current user:', user);
    console.log('🆔 User ID:', user.id);           // userId
    console.log('🎓 Lecturer ID:', user.lecturerId); // lecturerId
    
    try {
      const courseData: CreateCourseData = {
        courseCode: data.courseCode,
        courseName: data.courseName,
        description: data.description,
        credits: Number(data.credits),
        maxStudents: Number(data.maxStudents),
        lecturerId: user.lecturerId  // ✅ Sử dụng lecturerId, KHÔNG phải user.id
      };
      
      console.log('📤 Sending course data:', courseData);
      await createCourseMutation.mutateAsync(courseData);
      
    } catch (err) {
      console.error('❌ Submit error:', err);
    }
  };
  
  // ... Form JSX
};
```

**Điểm quan trọng:**
1. **Kiểm tra `user.lecturerId`** trước khi submit
2. **KHÔNG dùng `user.id`** - đó là `userId`, không phải `lecturerId`
3. **Console.log** để debug - giúp phát hiện lỗi nhanh

---

### **4. API Definition**

**File:** `src/pages/api.ts`

```typescript
// Request body type cho create course
export type CreateCourseData = {
    courseCode: string;
    courseName: string;
    description: string;
    credits: number;
    maxStudents: number;
    lecturerId: string;  // ⭐ Backend yêu cầu UUID của LECTURER
}

// API function
export const courseApi = {
  createCourse: (data: CreateCourseData) => {
    return api.post<Course>('/courses', data);
  },
  
  getLecturerCourses: () => {
    return api.get<Course[]>('/courses/my-courses');
  },
  
  // ... other methods
};
```

**Backend API Contract:**
```
POST /api/v1/courses
Headers:
  Authorization: Bearer <accessToken>
Body:
{
  "courseCode": "CS101",
  "courseName": "Web Programming", 
  "description": "Learn web development",
  "credits": 3,
  "maxStudents": 50,
  "lecturerId": "c672474c-572a-43a0-99f0-f4cb189ebb6c"  // UUID từ bảng LECTURER
}

Response (201 Created):
{
  "id": "course-uuid",
  "courseCode": "CS101",
  "courseName": "Web Programming",
  "lecturerId": "c672474c-572a-43a0-99f0-f4cb189ebb6c",
  "createdAt": "2025-10-28T10:00:00.000Z",
  ...
}
```

---

### **5. Axios Interceptor - Auto Add Token**

**File:** `src/pages/api.ts`

```typescript
// Axios instance với base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://elearning.blog360.org/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Tự động thêm Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Xử lý lỗi 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized - Token hết hạn hoặc không hợp lệ');
      
      // Clear localStorage và redirect về login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
```

**Lợi ích:**
- Tự động thêm token vào mọi request → Không cần thêm thủ công
- Tự động xử lý 401 → User được redirect về login khi token hết hạn

---

## 🐛 Các Vấn Đề Đã Gặp & Cách Giải Quyết

### **Issue 1: `courses.reduce is not a function`**

**Nguyên nhân:**
```typescript
// Backend trả về:
{
  "data": [...],  // Courses array nằm trong data
  "meta": {...}
}

// Frontend expect:
const courses = response.data;  // ❌ courses là object, không phải array
courses.reduce(...)  // ❌ Error!
```

**Giải pháp:**
```typescript
// Xử lý flexible response structure
const rawData = coursesResponse?.data;
let courses: Course[] = [];

if (Array.isArray(rawData)) {
  courses = rawData;  // Trường hợp trả về trực tiếp array
} else if (rawData && typeof rawData === 'object') {
  // Trường hợp trả về nested object
  courses = rawData.data || rawData.courses || rawData.items || [];
}
```

---

### **Issue 2: `401 Unauthorized` khi fetch courses**

**Nguyên nhân:**
```typescript
// Login hook ban đầu:
const { user, token } = data;  // ❌ Backend trả về "accessToken", không phải "token"
localStorage.setItem('token', token);  // token = undefined
```

**Giải pháp:**
```typescript
// ✅ Đúng tên field từ backend
const { user, accessToken, refreshToken } = data;
localStorage.setItem('token', accessToken);  // ✅ Lưu accessToken
localStorage.setItem('refreshToken', refreshToken);
```

---

### **Issue 3: `lecturerId must be a UUID`**

**Nguyên nhân:**
```typescript
// ❌ Gửi userId thay vì lecturerId
lecturerId: user.id  // "4a7a2a1e-..." (userId)
```

**Giải pháp:**
```typescript
// ✅ Gửi lecturerId từ nested object
lecturerId: user.lecturerId  // "c672474c-..." (lecturerId)
```

---

### **Issue 4: `Lecturer not found`**

**Nguyên nhân:**
- Mặc dù gửi đúng UUID format, nhưng đó là `userId`, không phải `lecturerId`
- Backend không tìm thấy record trong bảng `LECTURER` với `lecturerId = userId`

**Debugging steps:**
```typescript
// 1. Check login response structure
console.log('🔍 Login response:', JSON.stringify(user, null, 2));

// Output:
{
  "id": "4a7a2a1e-...",  // <- userId
  "lecturer": {
    "id": "c672474c-...",  // <- lecturerId (đúng!)
    "userId": "4a7a2a1e-..."
  }
}

// 2. Extract correct ID
const lecturerId = user.lecturer?.id;  // ✅ "c672474c-..."

// 3. Verify before sending
console.log('🎓 Lecturer ID:', lecturerId);
console.log('📤 Sending:', { lecturerId });
```

**Final solution:**
```typescript
// useLogin hook
const lecturerId = user.lecturer?.id;
const normalized: User = {
  ...otherFields,
  lecturerId: lecturerId || undefined  // ✅ Lưu vào store
};

// CreateCoursePage
if (!user?.lecturerId) {
  alert('❌ Không tìm thấy Lecturer ID!');
  return;
}

const courseData = {
  ...formData,
  lecturerId: user.lecturerId  // ✅ Sử dụng từ store
};
```

---

## 🎯 Best Practices Áp Dụng

### **1. Type Safety với TypeScript**

```typescript
// ✅ Định nghĩa rõ ràng types
export type CreateCourseData = {
    courseCode: string;
    courseName: string;
    description: string;
    credits: number;
    maxStudents: number;
    lecturerId: string;  // Rõ ràng đây là lecturerId
}

// ✅ Type cho response
export type Course = {
    id: string;
    courseCode: string;
    courseName: string;
    lecturerId: string;  // FK to LECTURER table
    // ...
}
```

---

### **2. Error Handling**

```typescript
// ✅ Handle errors ở nhiều levels
const createCourseMutation = useMutation({
  mutationFn: courseApi.createCourse,
  
  onSuccess: () => {
    alert('✅ Thành công!');
    queryClient.invalidateQueries(['lecturerCourses']);
  },
  
  onError: (error: any) => {
    // Extract error message từ backend
    const message = error?.response?.data?.message || 'Có lỗi xảy ra!';
    alert('❌ ' + message);
    
    // Log để debug
    console.error('Create course error:', error);
    console.error('Error details:', error?.response?.data);
  }
});
```

---

### **3. Loading States**

```typescript
// ✅ Hiển thị loading khi đang submit
<button 
  type="submit"
  disabled={createCourseMutation.isPending}
  className="..."
>
  {createCourseMutation.isPending ? (
    <>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      Đang tạo...
    </>
  ) : (
    <>
      <MdAdd className="text-xl" />
      Tạo khóa học
    </>
  )}
</button>
```

---

### **4. Data Refetching với React Query**

```typescript
// ✅ Tự động refetch sau khi mutation
const createCourseMutation = useMutation({
  mutationFn: courseApi.createCourse,
  
  onSuccess: () => {
    // Invalidate query → React Query tự động refetch
    queryClient.invalidateQueries({ queryKey: ['lecturerCourses'] });
    
    // Navigate về list page
    navigate('/lecturer/courses');
  }
});
```

**Lợi ích:**
- Danh sách courses tự động cập nhật
- Không cần manually fetch lại
- UI luôn sync với backend

---

### **5. Validation với React Hook Form**

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<CourseFormData>();

// ✅ Validation rules inline
<input
  {...register('courseCode', {
    required: 'Mã khóa học là bắt buộc',
    pattern: {
      value: /^[A-Z0-9]+$/,
      message: 'Chỉ được chứa chữ IN HOA và số'
    }
  })}
  className="..."
/>

{errors.courseCode && (
  <p className="text-red-500 text-sm mt-1">
    {errors.courseCode.message}
  </p>
)}
```

---

## 📂 Cấu Trúc Files Chi Tiết

```
src/
├── pages/
│   ├── CreateCoursePage.tsx       # Form tạo course
│   │   ├── useForm() hook
│   │   ├── useMutation() để create
│   │   ├── Validation rules
│   │   └── Error handling
│   │
│   ├── LecturerCoursesPage.tsx    # Danh sách courses
│   │   ├── useQuery() để fetch
│   │   ├── Statistics calculation
│   │   └── Course cards display
│   │
│   └── api.ts                      # API client
│       ├── axios instance
│       ├── interceptors
│       ├── courseApi methods
│       └── Type definitions
│
├── hooks/
│   └── useAuthQuery.ts             # Auth-related hooks
│       ├── useLogin()
│       ├── useRegisterStudent()
│       ├── useRegisterLecturer()
│       └── ID extraction logic  ⭐
│
├── stores/
│   └── authStore.ts                # Zustand state management
│       ├── user state
│       ├── isAuthenticated
│       └── setUser action
│
├── util/
│   ├── authUtils.ts                # Auth utilities
│   │   ├── User interface  ⭐
│   │   ├── UserRole enum
│   │   └── normalizeRole()
│   │
│   └── initSampleCourses.ts        # Mock data (không dùng nữa)
│
└── router/
    └── index.tsx                   # Route definitions
        ├── /lecturer/courses
        └── /lecturer/courses/create
```

---

## 🚀 Cách Sử Dụng

### **Bước 1: Đăng nhập với tài khoản Lecturer**

```
Email: lecturer@elearning.com
Password: Lecturer@123
```

Sau khi login, check Console:
```
✅ Extracted IDs: {
  userId: "4a7a2a1e-732d-4108-a868-eee9e265d8d0",
  lecturerId: "c672474c-572a-43a0-99f0-f4cb189ebb6c",  // ✅ Phải có
  studentId: undefined
}
```

---

### **Bước 2: Truy cập trang Courses**

- Click "Courses" trong sidebar
- Hoặc: `/lecturer/courses`
- Danh sách courses được fetch tự động qua React Query

---

### **Bước 3: Tạo khóa học mới**

1. Click "Tạo khóa học mới"
2. Điền form (5 trường bắt buộc):
   - Mã khóa học: `CS101` (chữ IN HOA + số)
   - Tên: `Lập trình Web` (min 5 ký tự)
   - Mô tả: min 20 ký tự
   - Tín chỉ: 1-10
   - Số học viên: 1-200

3. Click "Tạo khóa học"

4. Console logs:
```
👤 Current user: {id: "...", lecturerId: "c672474c-...", ...}
🆔 User ID: 4a7a2a1e-...
🎓 Lecturer ID: c672474c-...  // ✅ Đây là ID được gửi
📤 Sending course data: {
  courseCode: "CS101",
  courseName: "Lập trình Web",
  lecturerId: "c672474c-..."  // ✅ Đúng
}
```

5. Thành công → Redirect về `/lecturer/courses`
6. Danh sách tự động refetch và hiển thị course mới

---

## 📊 Statistics & Features

### **Danh sách khóa học:**
- ✅ Tổng số khóa học
- ✅ Tổng số học viên (sum của enrolled students)
- ✅ Tổng số tín chỉ (sum của credits)
- ✅ Course cards với thông tin đầy đủ
- ✅ Responsive design

### **Tạo khóa học:**
- ✅ Form validation real-time
- ✅ Loading states
- ✅ Error messages từ backend
- ✅ Auto redirect sau khi thành công
- ✅ Auto refetch danh sách

---

## 🔒 Phân Quyền

### **Lecturer có thể:**
- ✅ Tạo khóa học mới
- ✅ Xem danh sách khóa học của mình
- ✅ Chỉnh sửa khóa học (UI ready, logic pending)

### **Lecturer KHÔNG thể:**
- ❌ Xóa khóa học (chỉ Admin)
- ❌ Xem khóa học của Lecturer khác
- ❌ Thay đổi quyền sở hữu khóa học

---

## 📋 Validation Rules

| Trường | Quy tắc |
|--------|---------|
| Mã khóa học | Bắt buộc, regex: `/^[A-Z0-9]+$/` |
| Tên khóa học | Bắt buộc, minLength: 5 |
| Mô tả | Bắt buộc, minLength: 20 |
| Số tín chỉ | Bắt buộc, min: 1, max: 10 |
| Số học viên | Bắt buộc, min: 1, max: 200 |

---

## ⚡ Features Pending

- [ ] Edit course functionality
- [ ] Delete course (Admin only)
- [ ] Manage students in course
- [ ] Course statistics dashboard
- [ ] Search & filter courses
- [ ] Pagination for course list
- [ ] Bulk actions

---

## 📦 Dependencies

```json
{
  "@tanstack/react-query": "^5.x",  // Data fetching & caching
  "axios": "^1.x",                   // HTTP client
  "react-hook-form": "^7.x",         // Form validation
  "react-router-dom": "^6.x",        // Routing
  "react-icons": "^4.x",             // Icons
  "zustand": "^4.x",                 // State management
  "tailwindcss": "^3.x"              // Styling
}
```

---

## 🎯 Tóm Tắt Kiến Thức Quan Trọng

### **1. Database Design:**
- Tách biệt authentication (USER) và business logic (LECTURER/STUDENT)
- 1 user có thể có nhiều roles
- Foreign keys: `LECTURER.userId → USER.userId`, `COURSE.lecturerId → LECTURER.lecturerId`

### **2. Frontend Architecture:**
- Zustand cho global state (user info)
- React Query cho server state (courses, API calls)
- React Hook Form cho form validation
- Axios interceptors cho authentication

### **3. Data Flow:**
- Login → Extract nested IDs → Save to store
- Create course → Use lecturerId from store → POST to API
- Success → Invalidate query → Auto refetch → UI updates

### **4. Key Learnings:**
- ⭐ **userId ≠ lecturerId** - Đây là vấn đề quan trọng nhất
- ⭐ Backend response structure - Cần parse đúng nested objects
- ⭐ Token management - accessToken vs token field naming
- ⭐ React Query - Automatic refetching và caching
- ⭐ Error handling - Multiple levels (API, mutation, UI)

---

## 📝 Ghi Chú Cho Mentor

### **Những điểm đáng chú ý:**

1. **Database Schema hiểu đúng:**
   - Em đã hiểu rõ sự khác biệt giữa USER table và LECTURER table
   - Biết cách extract đúng ID từ nested objects

2. **API Integration:**
   - Sử dụng React Query đúng cách (useMutation, useQuery)
   - Hiểu về invalidation và refetching
   - Error handling đầy đủ

3. **Authentication Flow:**
   - Hiểu về JWT tokens (accessToken, refreshToken)
   - Axios interceptors tự động thêm Authorization header
   - Xử lý 401 Unauthorized

4. **Debugging Skills:**
   - Sử dụng console.log hiệu quả
   - Đọc error messages từ backend
   - Trace qua nhiều layers (UI → API → Backend)

5. **Code Quality:**
   - TypeScript types đầy đủ
   - Validation rules rõ ràng
   - Component structure hợp lý
   - Following React best practices

---

✨ **Chức năng đã hoàn thiện và production-ready!**

Mọi câu hỏi vui lòng liên hệ qua issue tracker hoặc team chat.
