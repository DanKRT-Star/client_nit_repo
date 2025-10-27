# 🔄 Hướng Dẫn Migrate từ Context API sang Zustand

## 📚 Mục lục
1. [Lý thuyết cơ bản](#lý-thuyết-cơ-bản)
2. [So sánh Context API vs Zustand](#so-sánh-context-api-vs-zustand)
3. [Cài đặt Zustand](#cài-đặt-zustand)
4. [Tạo Auth Store với Zustand](#tạo-auth-store-với-zustand)
5. [Migrate từng bước](#migrate-từng-bước)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Lý thuyết cơ bản

### 1. Context API là gì?

**Context API** là một giải pháp built-in của React để chia sẻ state giữa các components mà không cần truyền props xuống từng cấp (prop drilling).

#### Cách hoạt động:
```typescript
// 1. Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Tạo Provider wrap toàn bộ app
<AuthProvider>
  <App />
</AuthProvider>

// 3. Sử dụng ở bất kỳ component nào
const { user, login } = useAuth();
```

#### ⚠️ Hạn chế của Context API:

1. **Re-render không cần thiết**: 
   - Khi bất kỳ giá trị nào trong Context thay đổi, TẤT CẢ components subscribe đều re-render
   - Ngay cả khi component chỉ dùng 1 giá trị nhỏ

2. **Boilerplate code nhiều**:
   - Phải tạo Context, Provider, custom hook
   - Code dài dòng, khó maintain

3. **Performance**: 
   - Không có cơ chế tối ưu built-in
   - Phải tự implement memoization, useMemo, useCallback

4. **Testing phức tạp**:
   - Phải wrap mọi test với Provider
   - Khó mock và test riêng lẻ

**Ví dụ vấn đề re-render:**
```typescript
// AuthContext có: user, isLoading, login, logout
const AuthContext = { user, isLoading, login, logout };

// Component A chỉ cần user
function ComponentA() {
  const { user } = useAuth(); // ❌ Vẫn re-render khi isLoading thay đổi
  return <div>{user?.name}</div>;
}

// Component B chỉ cần isLoading
function ComponentB() {
  const { isLoading } = useAuth(); // ❌ Vẫn re-render khi user thay đổi
  return <div>{isLoading ? 'Loading...' : 'Ready'}</div>;
}
```

---

### 2. Zustand là gì?

**Zustand** là một thư viện state management siêu nhẹ (< 1KB), đơn giản và hiệu năng cao.

#### Đặc điểm nổi bật:

1. **✅ Minimal boilerplate**: Code ngắn gọn, dễ hiểu
2. **✅ Performance tối ưu**: Chỉ re-render component khi selector thay đổi
3. **✅ TypeScript first**: Type inference tuyệt vời
4. **✅ No providers**: Không cần wrap app
5. **✅ DevTools**: Tích hợp Redux DevTools
6. **✅ Middleware**: Hỗ trợ persist, immer, devtools

#### Triết lý:
> "Make state management simple, straightforward, and scalable"

---

## So sánh Context API vs Zustand

| Tiêu chí | Context API | Zustand | Ghi chú |
|----------|-------------|---------|---------|
| **Bundle size** | 0 KB (built-in) | ~1 KB | Zustand rất nhẹ |
| **Boilerplate** | Nhiều (Provider, Context, Hook) | Ít (chỉ create store) | Zustand thắng |
| **Performance** | ⚠️ Re-render toàn bộ | ✅ Selective re-render | Zustand tối ưu hơn |
| **Learning curve** | Dễ (built-in React) | Dễ (API đơn giản) | Ngang nhau |
| **TypeScript** | ⚠️ Cần nhiều type manually | ✅ Auto infer types | Zustand tốt hơn |
| **DevTools** | ❌ Không có | ✅ Redux DevTools | Zustand thắng |
| **Testing** | ⚠️ Cần wrap Provider | ✅ Import trực tiếp | Zustand dễ hơn |
| **Middleware** | ❌ Không có | ✅ Persist, Immer, etc | Zustand mạnh hơn |

### Khi nào dùng Context API?
- ✅ State đơn giản, ít thay đổi (theme, locale)
- ✅ Không muốn thêm dependency
- ✅ App nhỏ, không quan tâm performance

### Khi nào dùng Zustand?
- ✅ State phức tạp (auth, cart, app state)
- ✅ Cần performance tối ưu
- ✅ Muốn code ngắn gọn, dễ maintain
- ✅ Cần DevTools để debug

---

## Cài đặt Zustand

```bash
# Dùng npm
npm install zustand

# Dùng yarn
yarn add zustand

# Dùng pnpm
pnpm add zustand
```

---

## Tạo Auth Store với Zustand

### Bước 1: Tạo file `src/stores/authStore.ts`

```typescript
import { create } from 'zustand';
import { authApi } from '../pages/api';
import { User, UserRole, normalizeRole } from '../context/authUtils';

// 1️⃣ Định nghĩa interface cho Store
interface AuthStore {
  // State
  user: User | null;
  isLoading: boolean;
  
  // Computed values (getters)
  isAuthenticated: boolean;
  isStudent: boolean;
  isLecturer: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{success: boolean, message: string}>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  register: (
    role: 'student' | 'lecturer',
    data: any
  ) => Promise<{success: boolean, message: string}>;
}

// 2️⃣ Tạo store với create()
export const useAuthStore = create<AuthStore>((set, get) => ({
  // State khởi tạo
  user: null,
  isLoading: true,
  
  // Computed values - dùng getter
  get isAuthenticated() {
    return !!get().user;
  },
  get isStudent() {
    return get().user?.role === UserRole.STUDENT;
  },
  get isLecturer() {
    return get().user?.role === UserRole.LECTURER;
  },
  
  // Actions
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.data) {
        const { user, token } = response.data;
        
        const normalized: User = {
          id: String(user.id),
          email: user.email,
          full_name: user.fullName || user.full_name,
          avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
          role: normalizeRole(user.role),
          phone: user.phone,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt
        };
        
        // 3️⃣ Update state với set()
        set({ user: normalized, isLoading: false });
        
        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify({ id: normalized.id, role: normalized.role }));
        localStorage.setItem('token', token);
        
        return { success: true, message: "Đăng nhập thành công!" };
      }
      
      return { success: false, message: "Đăng nhập thất bại!" };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || "Có lỗi xảy ra!" };
    }
  },
  
  logout: () => {
    set({ user: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  
  checkAuth: async () => {
    const savedToken = localStorage.getItem('token');
    
    if (savedToken) {
      try {
        const response = await authApi.getCurrentUser();
        if (response.data) {
          const normalized: User = {
            id: String(response.data.id),
            email: response.data.email,
            full_name: response.data.fullName || response.data.full_name,
            avatar: response.data.avatar,
            role: normalizeRole(response.data.role),
            phone: response.data.phone,
            createdAt: response.data.createdAt || new Date().toISOString(),
            updatedAt: response.data.updatedAt
          };
          set({ user: normalized, isLoading: false });
        } else {
          set({ user: null, isLoading: false });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        set({ user: null, isLoading: false });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      set({ isLoading: false });
    }
  },
  
  register: async (role, data) => {
    // Implementation tương tự login...
    return { success: true, message: "Đăng ký thành công!" };
  }
}));
```

### 🔑 Giải thích các khái niệm quan trọng:

#### 1. `create()` function
```typescript
const useAuthStore = create<AuthStore>((set, get) => ({
  // store definition
}))
```
- `set`: Function để update state
- `get`: Function để đọc state hiện tại
- Return một React hook (`useAuthStore`)

#### 2. `set()` function
```typescript
// Merge update (shallow)
set({ user: newUser }); // Chỉ update user, giữ nguyên các field khác

// Replace update
set(() => ({ user: newUser, isLoading: false })); // Replace toàn bộ

// Update dựa trên state cũ
set((state) => ({ count: state.count + 1 }));
```

#### 3. `get()` function
```typescript
// Đọc state hiện tại
const currentUser = get().user;

// Sử dụng trong computed values
get isAuthenticated() {
  return !!get().user; // Luôn lấy giá trị mới nhất
}
```

#### 4. Computed values (Getters)
```typescript
// ⚠️ VẤN ĐỀ: Getters không reactive trong Zustand
get isAuthenticated() {
  return !!get().user;
}

// ❌ Sai: Component không re-render khi user thay đổi
const isAuth = useAuthStore(state => state.isAuthenticated);

// ✅ Đúng: Subscribe trực tiếp vào user
const user = useAuthStore(state => state.user);
const isAuth = !!user; // Tính toán trong component
```

---

## Migrate từng bước

### Bước 1: Sửa `main.tsx` - Bỏ AuthProvider

**❌ Trước (Context API):**
```typescript
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

**✅ Sau (Zustand):**
```typescript
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'

// Component wrapper để gọi checkAuth
function AppWrapper() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWrapper />
    </QueryClientProvider>
  </StrictMode>,
)
```

**📝 Giải thích:**
- Không cần Provider nữa
- Gọi `checkAuth()` khi app mount
- Clean và đơn giản hơn

---

### Bước 2: Sửa Components - Thay useAuth() bằng useAuthStore()

#### 2.1. Component đơn giản (chỉ cần 1 giá trị)

**❌ Trước:**
```typescript
import { useAuth } from '../context/AuthContext';

function App() {
  const { user } = useAuth();
  
  return <h1>Welcome {user?.full_name}</h1>;
}
```

**✅ Sau:**
```typescript
import { useAuthStore } from '../stores/authStore';

function App() {
  const user = useAuthStore(state => state.user);
  
  return <h1>Welcome {user?.full_name}</h1>;
}
```

**📝 Ưu điểm:**
- Component chỉ re-render khi `user` thay đổi
- Không re-render khi `isLoading` hoặc các giá trị khác thay đổi

---

#### 2.2. Component cần nhiều giá trị

**❌ Trước:**
```typescript
function Header() {
  const { user, logout, isLecturer } = useAuth();
  // ...
}
```

**✅ Sau (Cách 1 - Separate selectors):**
```typescript
function Header() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const isLecturer = user?.role === UserRole.LECTURER;
  // ...
}
```

**✅ Sau (Cách 2 - Multiple values):**
```typescript
function Header() {
  const { user, logout } = useAuthStore(state => ({
    user: state.user,
    logout: state.logout
  }));
  const isLecturer = user?.role === UserRole.LECTURER;
  // ...
}
```

**⚠️ Lưu ý:**
```typescript
// ❌ Sai: Sẽ re-render khi BẤT KỲ giá trị nào thay đổi
const store = useAuthStore();
const user = store.user;

// ✅ Đúng: Chỉ re-render khi user thay đổi
const user = useAuthStore(state => state.user);
```

---

#### 2.3. LoginPage

**❌ Trước:**
```typescript
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    }
  };
}
```

**✅ Sau:**
```typescript
import { useAuthStore } from '../stores/authStore';

function LoginPage() {
  const login = useAuthStore(state => state.login);
  
  const handleSubmit = async (e) => {
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    }
  };
}
```

---

#### 2.4. Protected Route

**❌ Trước:**
```typescript
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}
```

**✅ Sau:**
```typescript
import { useAuthStore } from '../stores/authStore';

function ProtectedRoute({ children }) {
  const user = useAuthStore(state => state.user);
  const isLoading = useAuthStore(state => state.isLoading);
  
  const isAuthenticated = !!user; // Tính toán trong component
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}
```

---

### Bước 3: Tổng hợp tất cả files cần sửa

| File | Thay đổi |
|------|----------|
| `main.tsx` | Bỏ `<AuthProvider>`, thêm `AppWrapper` gọi `checkAuth()` |
| `App.tsx` | `const { user } = useAuth()` → `const user = useAuthStore(state => state.user)` |
| `header.tsx` | Import từ `stores/authStore`, dùng separate selectors |
| `sidebar.tsx` | Tương tự header |
| `LoginPage.tsx` | `const { login } = useAuth()` → `const login = useAuthStore(state => state.login)` |
| `RegisterPage.tsx` | Tương tự LoginPage |
| `ProtectedRoute.tsx` | Tính toán `isAuthenticated` từ `user` |
| `RoleBasedRoute.tsx` | Subscribe vào `user` và `isLoading` |
| `RoleRedirect.tsx` | Subscribe vào `user` |

---

## Best Practices

### 1. Selector Optimization

```typescript
// ❌ BAD: Re-render mọi khi store thay đổi
const state = useAuthStore();

// ✅ GOOD: Chỉ re-render khi user thay đổi
const user = useAuthStore(state => state.user);

// ✅ GOOD: Multiple values với shallow compare
import { shallow } from 'zustand/shallow';

const { user, isLoading } = useAuthStore(
  state => ({ user: state.user, isLoading: state.isLoading }),
  shallow
);
```

### 2. Computed Values

```typescript
// ❌ BAD: Dùng getters (không reactive)
const isAuth = useAuthStore(state => state.isAuthenticated);

// ✅ GOOD: Tính toán trong component
const user = useAuthStore(state => state.user);
const isAuth = !!user;

// ✅ BETTER: useMemo cho logic phức tạp
const user = useAuthStore(state => state.user);
const userPermissions = useMemo(() => {
  return calculatePermissions(user);
}, [user]);
```

### 3. Actions Organization

```typescript
// ✅ GOOD: Group related actions
export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  
  // Auth actions
  login: async (email, password) => { /* ... */ },
  logout: () => { /* ... */ },
  register: async (data) => { /* ... */ },
  
  // User actions
  updateProfile: async (data) => { /* ... */ },
  changePassword: async (old, newPass) => { /* ... */ },
}));
```

### 4. Middleware sử dụng

#### Persist (lưu vào localStorage)
```typescript
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      login: async (email, password) => { /* ... */ },
      // ...
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ user: state.user }), // Chỉ lưu user
    }
  )
);
```

#### DevTools
```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      user: null,
      // ...
    }),
    { name: 'AuthStore' }
  )
);
```

#### Combine nhiều middleware
```typescript
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // store definition
      }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' }
  )
);
```

### 5. Testing

```typescript
// ✅ Dễ test hơn Context API
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './authStore';

test('login updates user', async () => {
  const { result } = renderHook(() => useAuthStore());
  
  await act(async () => {
    await result.current.login('test@example.com', 'password');
  });
  
  expect(result.current.user).toBeDefined();
  expect(result.current.user?.email).toBe('test@example.com');
});

// Reset state giữa các tests
beforeEach(() => {
  useAuthStore.setState({ user: null, isLoading: false });
});
```

### 6. TypeScript Tips

```typescript
// ✅ Export types cho reuse
export type AuthStore = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  // ...
};

// ✅ Type-safe selectors
const selectUser = (state: AuthStore) => state.user;
const user = useAuthStore(selectUser);

// ✅ Selector factories
const selectUserField = <K extends keyof User>(field: K) => 
  (state: AuthStore) => state.user?.[field];
  
const email = useAuthStore(selectUserField('email'));
```

---

## Troubleshooting

### Vấn đề 1: Component không re-render khi state thay đổi

**Nguyên nhân:** Dùng getter hoặc subscribe sai cách

```typescript
// ❌ Sai
const isAuth = useAuthStore(state => state.isAuthenticated); // getter

// ✅ Đúng
const user = useAuthStore(state => state.user);
const isAuth = !!user;
```

### Vấn đề 2: Re-render quá nhiều

**Nguyên nhân:** Subscribe vào toàn bộ store

```typescript
// ❌ Sai
const store = useAuthStore(); // Re-render khi bất kỳ field nào thay đổi

// ✅ Đúng
const user = useAuthStore(state => state.user); // Chỉ re-render khi user thay đổi
```

### Vấn đề 3: Actions không hoạt động

**Nguyên nhân:** Quên gọi `set()` để update state

```typescript
// ❌ Sai
login: async (email, password) => {
  const user = await authApi.login(email, password);
  // Quên set()
  return { success: true };
}

// ✅ Đúng
login: async (email, password) => {
  const user = await authApi.login(email, password);
  set({ user }); // Phải gọi set()
  return { success: true };
}
```

### Vấn đề 4: TypeScript errors

```typescript
// ❌ Sai: Thiếu generic type
const useAuthStore = create((set, get) => ({...}));

// ✅ Đúng: Có generic type
const useAuthStore = create<AuthStore>((set, get) => ({...}));
```

---

## Tài liệu tham khảo

- **Zustand Docs**: https://github.com/pmndrs/zustand
- **Zustand Best Practices**: https://tkdodo.eu/blog/working-with-zustand
- **Performance Comparison**: https://leerob.io/blog/react-state-management
- **Migration Guide**: https://docs.pmnd.rs/zustand/guides/migrating-to-v4

---

## Tóm tắt

### ✅ Ưu điểm của Zustand so với Context API:

1. **Performance**: Selective re-render, không re-render không cần thiết
2. **Code ngắn gọn**: Ít boilerplate, dễ đọc
3. **TypeScript**: Type inference tự động, ít phải type manually
4. **No Provider**: Không cần wrap app, sử dụng đơn giản
5. **DevTools**: Debug dễ dàng với Redux DevTools
6. **Testing**: Dễ test, không cần mock Provider
7. **Middleware**: Persist, Immer, DevTools built-in

### 📊 Kết luận:

- **Context API**: Phù hợp cho state đơn giản, ít thay đổi
- **Zustand**: Phù hợp cho state phức tạp, cần performance cao

Với auth state (user, login, logout, register), **Zustand là lựa chọn tốt hơn** vì:
- State thay đổi thường xuyên
- Nhiều components subscribe
- Cần performance tối ưu
- Actions phức tạp (async API calls)

---

💡 **Tip cuối cùng:** Bắt đầu với Zustand ngay từ đầu sẽ dễ hơn migrate sau này!

