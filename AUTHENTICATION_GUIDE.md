# 🔐 Hướng Dẫn Chi Tiết - Authentication & Authorization

> **Nhánh:** `r2s-02`  
> **Tính năng:** Đăng nhập, Đăng ký, Phân quyền theo Role (Student/Mentor)

---

## 📋 Mục Lục

1. [Tổng Quan](#-tổng-quan)
2. [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
3. [Database Schema](#-database-schema)
4. [Authentication Flow](#-authentication-flow)
5. [Authorization Flow](#-authorization-flow)
6. [Components Chi Tiết](#-components-chi-tiết)
7. [API Endpoints](#-api-endpoints)
8. [State Management](#-state-management)
9. [Routing Strategy](#-routing-strategy)
10. [Bảo Mật](#-bảo-mật)
11. [Testing](#-testing)

---

## 🎯 Tổng Quan

Hệ thống authentication được xây dựng với:
- **React Context API** cho state management
- **React Router v7** cho routing và navigation
- **JSON Server** làm mock backend
- **LocalStorage** để lưu trạng thái đăng nhập
- **Role-based Access Control (RBAC)** với 2 roles: Student (1) và Mentor (2)

### Tính năng chính:
- ✅ Đăng nhập/Đăng ký với validation
- ✅ Phân quyền theo role (Student/Mentor)
- ✅ Protected routes (chỉ truy cập khi đã đăng nhập)
- ✅ Role-based routes (routes riêng cho từng role)
- ✅ Persistent authentication (giữ trạng thái sau khi refresh)
- ✅ Auto redirect dựa trên role
- ✅ Logout functionality

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   LoginPage / RegisterPage                   │
│              (Form validation & submission)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuthContext                               │
│   - login()                                                  │
│   - register()                                               │
│   - logout()                                                 │
│   - State: user, isAuthenticated, isLoading                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    authApi (API Layer)                       │
│   - login(email, password)                                   │
│   - register(userData)                                       │
│   - checkEmailExists(email)                                  │
│   - getUserById(id)                                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  JSON Server (Mock Backend)                  │
│                  http://localhost:3002                       │
│   - GET /users?email=...&password=...                        │
│   - POST /users                                              │
│   - GET /users/:id                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      db.json                                 │
│   { "users": [...], "courses": [...], ... }                │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### User Object trong `db.json`

```json
{
  "id": "1",
  "email": "student@example.com",
  "password": "student123",
  "full_name": "Nguyễn Văn A",
  "avatar": "https://i.pravatar.cc/150?img=1",
  "role": 1,
  "phone": "0123456789",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Giải thích các field:

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | string | Unique identifier của user |
| `email` | string | Email đăng nhập (unique) |
| `password` | string | Mật khẩu (plain text - chỉ demo) |
| `full_name` | string | Tên đầy đủ của user |
| `avatar` | string | URL ảnh đại diện |
| `role` | number | 1 = Student, 2 = Mentor |
| `phone` | string | Số điện thoại (optional) |
| `createdAt` | string | Timestamp tạo tài khoản |
| `updatedAt` | string | Timestamp cập nhật cuối |

### Role Definition:

```typescript
export const UserRole = {
  STUDENT: 1,
  MENTOR: 2
} as const;
```

---

## 🔄 Authentication Flow

### 1. **Đăng Nhập (Login Flow)**

```
User nhập email + password
        │
        ▼
Click "Đăng nhập"
        │
        ▼
LoginPage.handleSubmit()
        │
        ├─► Validation
        │   ├─► Email/password rỗng? → Show error
        │   └─► OK → Continue
        │
        ▼
AuthContext.login(email, password)
        │
        ▼
authApi.login(email, password)
        │
        ▼
GET /users?email=xxx&password=yyy
        │
        ├─► Không tìm thấy user → Return error
        │
        └─► Tìm thấy user
                │
                ▼
        Lấy user data từ response.data[0]
                │
                ▼
        Loại bỏ password khỏi object
                │
                ▼
        Normalize role (string/number → UserRole enum)
                │
                ▼
        Lưu vào state: setUser(normalizedUser)
                │
                ▼
        Lưu vào localStorage:
            - localStorage.setItem('user', JSON.stringify(user))
            - localStorage.setItem('token', user.id)
                │
                ▼
        Return { success: true, message: "Đăng nhập thành công!" }
                │
                ▼
        LoginPage nhận kết quả
                │
                ▼
        navigate('/') → RoleRedirect
                │
                ▼
        Check role:
            ├─► Student → redirect '/student'
            └─► Mentor → redirect '/mentor'
```

#### Code Example (AuthContext.tsx):

```typescript
const login = async (email: string, password: string) => {
  try {
    // 1. Gọi API
    const response = await authApi.login(email, password);
    
    // 2. Check response
    if (response.data && response.data.length > 0) {
      const raw = response.data[0]; // Lấy user đầu tiên
      
      // 3. Loại bỏ password
      const {password, ...rest} = raw as any; 
      void password;
      
      // 4. Normalize user data
      const normalized: User = {
        id: String(rest.id),
        email: rest.email,
        full_name: rest.full_name,
        avatar: rest.avatar,
        role: (rest.role === 2 || rest.role === '2' || rest.role === 'mentor') 
          ? UserRole.MENTOR 
          : UserRole.STUDENT,
        phone: rest.phone,
        createdAt: rest.createdAt,
        updatedAt: rest.updatedAt ?? rest.createdAt
      }
      
      // 5. Update state
      setUser(normalized);
      
      // 6. Lưu localStorage
      localStorage.setItem('user', JSON.stringify(normalized));
      localStorage.setItem('token', normalized.id);
      
      return {success: true, message:"Đăng nhập thành công!"};
    } else {
      return {success: false, message:"Đăng nhập thất bại!"}
    }
  } catch(error) {
    console.error('Login error:', error);
    return {success: false, message: "Có lỗi xảy ra khi đăng nhập!"};
  }
};
```

---

### 2. **Đăng Ký (Register Flow)**

```
User nhập form đăng ký
        │
        ▼
Click "Đăng ký"
        │
        ▼
RegisterPage.handleSubmit()
        │
        ├─► Validation
        │   ├─► Thiếu thông tin? → Show error
        │   ├─► Password < 8 ký tự? → Show error
        │   ├─► Password != confirmPassword? → Show error
        │   └─► OK → Continue
        │
        ▼
AuthContext.register(userData)
        │
        ▼
Check email đã tồn tại chưa
GET /users?email=xxx
        │
        ├─► Email đã tồn tại → Return error
        │
        └─► Email chưa tồn tại
                │
                ▼
        authApi.register(userData)
                │
                ▼
        Tạo newUser object:
            - userData (from form)
            - avatar: random từ pravatar.cc
            - role: 1 (Student mặc định)
            - createdAt: now
            - updatedAt: now
                │
                ▼
        POST /users với newUser
                │
                ▼
        Nhận response (user mới được tạo)
                │
                ▼
        Loại bỏ password
                │
                ▼
        Lưu vào state & localStorage
                │
                ▼
        Return { success: true, message: "Đăng ký thành công!" }
                │
                ▼
        RegisterPage nhận kết quả
                │
                ▼
        navigate('/') → Auto redirect theo role
```

#### Code Example (authApi - api.ts):

```typescript
register: (userData: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}) => {
  const newUser = {
    ...userData,
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    role: 1, // Mặc định Student
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return api.post('/users', newUser);
}
```

---

### 3. **Persistent Authentication (Giữ trạng thái)**

Khi user refresh trang, app phải giữ trạng thái đăng nhập:

```
App khởi động
        │
        ▼
AuthProvider render
        │
        ▼
useEffect(() => { checkAuth() }, [])
        │
        ▼
Đọc localStorage:
    - savedUser = localStorage.getItem('user')
    - savedToken = localStorage.getItem('token')
        │
        ├─► Không có? → setIsLoading(false), done
        │
        └─► Có savedUser & savedToken
                │
                ▼
        Parse savedUser JSON
                │
                ▼
        Verify token khớp user.id?
                │
                ├─► Không khớp → Clear localStorage
                │
                └─► Khớp
                        │
                        ▼
                Fetch user mới nhất từ server
                GET /users/:id
                        │
                        ├─► Error → Clear localStorage
                        │
                        └─► Success
                                │
                                ▼
                        Normalize user data
                                │
                                ▼
                        setUser(normalizedUser)
                                │
                                ▼
                        setIsLoading(false)
                                │
                                ▼
                        User đã đăng nhập!
```

#### Code Example:

```typescript
useEffect(() => {
  const checkAuth = async () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if(savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        
        // Verify token
        if(String(savedToken) !== String(parsed?.id)) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setIsLoading(false);
          return;
        }
        
        // Fetch latest user data
        const response = await authApi.getUserById(parsed.id);
        if(response.data){
          const serverUser = response.data;
          // Normalize và set user...
          setUser(normalized);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch(error){
        console.error("Auth check failed:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  };
  checkAuth();
}, []);
```

---

### 4. **Logout Flow**

```
User click "Đăng xuất"
        │
        ▼
AuthContext.logout()
        │
        ▼
Clear state: setUser(null)
        │
        ▼
Clear localStorage:
    - localStorage.removeItem('user')
    - localStorage.removeItem('token')
        │
        ▼
navigate('/login')
        │
        ▼
User quay về trang đăng nhập
```

---

## 🔒 Authorization Flow (Phân Quyền)

### Role-Based Access Control (RBAC)

Hệ thống có 2 loại routes:
1. **Protected Routes**: Cần đăng nhập (bất kỳ role nào)
2. **Role-Based Routes**: Cần đăng nhập + đúng role

### Flow kiểm tra quyền truy cập:

```
User truy cập route
        │
        ▼
Router check route type
        │
        ├─► Public route (/login, /register)
        │   └─► Cho phép truy cập
        │
        └─► Protected route
                │
                ▼
        ProtectedRoute component
                │
                ├─► isLoading? → Show loading spinner
                │
                ├─► !isAuthenticated? → Redirect to /login
                │
                └─► isAuthenticated
                        │
                        ▼
                RoleBasedRoute component (nếu có)
                        │
                        ├─► Role không hợp lệ?
                        │   ├─► Student trying /mentor → Redirect /student
                        │   └─► Mentor trying /student → Redirect /mentor
                        │
                        └─► Role hợp lệ
                                │
                                ▼
                        Render component
```

### Ví dụ Routes:

```typescript
// Student routes - chỉ Student mới vào được
{
  path: '/student',
  element: (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={[UserRole.STUDENT]}>
        <App />
      </RoleBasedRoute>
    </ProtectedRoute>
  ),
  children: [...]
}

// Mentor routes - chỉ Mentor mới vào được
{
  path: '/mentor',
  element: (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={[UserRole.MENTOR]}>
        <MentorApp />
      </RoleBasedRoute>
    </ProtectedRoute>
  ),
  children: [...]
}
```

---

## 📦 Components Chi Tiết

### 1. **AuthContext.tsx**

**Mục đích:** Quản lý state authentication toàn ứng dụng

**State:**
- `user`: User object hoặc null
- `isLoading`: Boolean - đang load auth state
- `isAuthenticated`: Boolean - user đã đăng nhập chưa
- `isStudent`: Boolean - user có phải Student không
- `isMentor`: Boolean - user có phải Mentor không

**Methods:**
- `login(email, password)`: Đăng nhập
- `register(userData)`: Đăng ký
- `logout()`: Đăng xuất

**Usage:**
```typescript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome {user?.full_name}</div>;
}
```

---

### 2. **ProtectedRoute.tsx**

**Mục đích:** Bảo vệ routes cần đăng nhập

**Logic:**
1. Nếu `isLoading` → Hiển thị loading spinner
2. Nếu `!isAuthenticated` → Redirect về `/login`
3. Nếu `isAuthenticated` → Render children

**Usage:**
```typescript
<ProtectedRoute>
  <App />
</ProtectedRoute>
```

---

### 3. **RoleBasedRoute.tsx**

**Mục đích:** Bảo vệ routes theo role cụ thể

**Props:**
- `children`: React components
- `allowedRoles`: Array các role được phép (e.g., `[1]`, `[2]`, `[1, 2]`)

**Logic:**
1. Nếu `isLoading` → Show loading
2. Nếu `!user` → Redirect `/login`
3. Nếu `user.role` không nằm trong `allowedRoles`:
   - Student → Redirect `/student`
   - Mentor → Redirect `/mentor`
4. Nếu hợp lệ → Render children

**Usage:**
```typescript
<RoleBasedRoute allowedRoles={[UserRole.STUDENT]}>
  <StudentDashboard />
</RoleBasedRoute>
```

---

### 4. **LoginPage.tsx**

**Mục đích:** UI form đăng nhập

**Features:**
- Form validation (email, password required)
- Error display
- Loading state
- Quick login info (demo accounts)
- Link to register page

**Flow:**
1. User nhập email + password
2. Click submit
3. Validation
4. Call `login()` từ AuthContext
5. Nếu success → navigate về trang trước hoặc `/`
6. Nếu fail → Show error message

---

### 5. **RegisterPage.tsx**

**Mục đích:** UI form đăng ký

**Features:**
- Form validation:
  - Full name, email, password required
  - Password >= 8 characters
  - Password = Confirm password
- Error display
- Loading state
- Link to login page

**Flow:**
1. User nhập form
2. Click submit
3. Validation
4. Call `register()` từ AuthContext
5. Nếu success → auto login và navigate `/`
6. Nếu fail → Show error message

---

### 6. **Header.tsx**

**Mục đích:** Navigation bar với user info

**Features:**
- Logo & navigation items
- Search bar
- Dark/Light mode toggle
- **User menu:**
  - Avatar
  - User name & email
  - Role badge (Student/Mentor)
  - Dropdown menu:
    - Thông tin cá nhân
    - Đăng xuất

**Role-aware:**
- Hiển thị role badge khác nhau cho Student/Mentor
- Logout redirect về `/login`

---

### 7. **Sidebar.tsx**

**Mục đích:** Sidebar navigation

**Features:**
- Responsive (mobile + desktop)
- **Dynamic navigation items based on role:**
  - Student: Courses, Calendar, Assignment, Blog
  - Mentor: Courses, Students, Analytics
- Auto generate paths với `baseUrl`:
  - Student: `/student/courses`, `/student/calendar`...
  - Mentor: `/mentor/courses`, `/mentor/students`...

**Logic:**
```typescript
const { user } = useAuth();
const baseUrl = user?.role === UserRole.MENTOR ? '/mentor' : '/student';

const navItems = user?.role === UserRole.MENTOR 
  ? ['Courses', 'Students', 'Analytics']
  : ['Courses', 'Calendar', 'Assignment', 'Blog'];
  
// Generate path
const path = `${baseUrl}/${name.toLowerCase()}`;
```

---

## 🌐 API Endpoints

### Base URL:
```
http://localhost:3002
```

### Endpoints:

#### 1. **Login**
```http
GET /users?email={email}&password={password}
```

**Response:**
```json
[
  {
    "id": "1",
    "email": "student@example.com",
    "password": "student123",
    "full_name": "Nguyễn Văn A",
    "role": 1,
    ...
  }
]
```

#### 2. **Register**
```http
POST /users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "New User",
  "phone": "0123456789",
  "avatar": "https://i.pravatar.cc/150?img=10",
  "role": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "4",
  "email": "newuser@example.com",
  ...
}
```

#### 3. **Check Email Exists**
```http
GET /users?email={email}
```

#### 4. **Get User by ID**
```http
GET /users/{id}
```

---

## 🗺️ Routing Strategy

### Route Structure:

```
/
├── /login              (Public)
├── /register           (Public)
├── /                   (Protected - Auto redirect by role)
├── /student            (Protected + Student only)
│   ├── /courses
│   ├── /calendar
│   ├── /assignment
│   └── /blog
├── /mentor             (Protected + Mentor only)
│   ├── /courses
│   ├── /students
│   └── /analytics
└── /*                  (404)
```

### Redirect Logic:

```typescript
function RoleRedirect() {
  const { user } = useAuth();
  
  if (user?.role === UserRole.MENTOR) {
    return <Navigate to="/mentor" replace />;
  }
  return <Navigate to="/student" replace />;
}
```

**Scenarios:**

| Tình huống | Kết quả |
|-----------|---------|
| Guest vào `/` | → Redirect `/login` |
| Guest vào `/student` | → Redirect `/login` |
| Student login → `/` | → Redirect `/student` |
| Mentor login → `/` | → Redirect `/mentor` |
| Student vào `/mentor` | → Redirect `/student` |
| Mentor vào `/student` | → Redirect `/mentor` |
| User logout | → Redirect `/login` |

---

## 🔐 Bảo Mật

### ⚠️ Lưu ý về bảo mật (Production):

**Hiện tại (Demo):**
- ❌ Password lưu plain text trong db.json
- ❌ Không có JWT token thật
- ❌ Không encrypt localStorage
- ❌ API không có authentication middleware

**Cần làm cho Production:**
1. **Backend thật:**
   - Hash password với bcrypt
   - Implement JWT tokens
   - Validate requests
   - Rate limiting
   - HTTPS only

2. **Frontend:**
   - Store JWT token securely
   - Implement token refresh
   - XSS protection
   - CSRF protection
   - Sanitize user input

3. **Database:**
   - Use real database (PostgreSQL, MongoDB...)
   - Encrypt sensitive data
   - Proper indexing

---

## 🧪 Testing

### Test Cases:

#### Authentication:
- [ ] Login với email/password đúng → Success
- [ ] Login với email/password sai → Error
- [ ] Login với email không tồn tại → Error
- [ ] Register với email mới → Success
- [ ] Register với email đã tồn tại → Error
- [ ] Register với password < 8 ký tự → Error
- [ ] Register với password != confirmPassword → Error
- [ ] Logout → Clear state & redirect login
- [ ] Refresh page khi đã login → Giữ trạng thái
- [ ] Refresh page khi chưa login → Vẫn ở login page

#### Authorization:
- [ ] Student truy cập `/student` → OK
- [ ] Student truy cập `/mentor` → Redirect `/student`
- [ ] Mentor truy cập `/mentor` → OK
- [ ] Mentor truy cập `/student` → Redirect `/mentor`
- [ ] Guest truy cập `/student` → Redirect `/login`
- [ ] Guest truy cập `/mentor` → Redirect `/login`
- [ ] Student login → Auto redirect `/student`
- [ ] Mentor login → Auto redirect `/mentor`

#### UI:
- [ ] Header hiển thị đúng role badge
- [ ] Sidebar hiển thị đúng menu theo role
- [ ] Dark mode hoạt động
- [ ] Responsive mobile/desktop
- [ ] Error messages hiển thị đúng
- [ ] Loading states hoạt động

---

## 📝 Hướng Dẫn Sử Dụng

### 1. Setup & Run:

```bash
# Install dependencies
npm install

# Start JSON Server (Terminal 1)
npx json-server db.json --port 3002

# Start Vite Dev Server (Terminal 2)
npm run dev
```

### 2. Test Accounts:

| Email | Password | Role |
|-------|----------|------|
| student@example.com | student123 | Student |
| mentor@example.com | mentor123 | Mentor |
| student2@example.com | test123 | Student |

### 3. Flow Test:

1. **Test Login:**
   - Vào `http://localhost:5173/login`
   - Login với account Student
   - Verify redirect về `/student`
   - Check sidebar có đúng menu Student
   - Check header có badge "Student"

2. **Test Role Switching:**
   - Logout
   - Login với account Mentor
   - Verify redirect về `/mentor`
   - Check sidebar có đúng menu Mentor
   - Check header có badge "Mentor"

3. **Test Protected Routes:**
   - Logout
   - Try access `http://localhost:5173/student`
   - Verify redirect về `/login`

4. **Test Register:**
   - Vào `/register`
   - Tạo account mới
   - Verify auto login và redirect

---

## 🔧 Troubleshooting

### Lỗi thường gặp:

**1. `ERR_CONNECTION_REFUSED`**
- **Nguyên nhân:** JSON Server chưa chạy
- **Giải pháp:** `npx json-server db.json --port 3002`

**2. Login failed nhưng email/password đúng**
- **Nguyên nhân:** API endpoint sai hoặc db.json không đúng format
- **Giải pháp:** Check console, verify db.json structure

**3. Infinite redirect loop**
- **Nguyên nhân:** Logic redirect bị conflict
- **Giải pháp:** Check ProtectedRoute và RoleBasedRoute logic

**4. User role hiển thị sai**
- **Nguyên nhân:** Role normalization logic lỗi
- **Giải pháp:** Check AuthContext login function, verify `response.data[0]`

**5. LocalStorage không persist**
- **Nguyên nhân:** Browser blocking localStorage hoặc code lỗi
- **Giải pháp:** Check browser settings, console errors

---

## 📚 Tài Liệu Tham Khảo

- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [React Router v7](https://reactrouter.com/)
- [JSON Server](https://github.com/typicode/json-server)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu có thắc mắc hoặc gặp bug, vui lòng tạo issue hoặc liên hệ team.

---

**Last Updated:** 2025-01-20  
**Version:** 1.0  
**Branch:** `r2s-02`

