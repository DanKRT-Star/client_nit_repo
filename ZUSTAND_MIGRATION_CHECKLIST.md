# ✅ Checklist Migration từ AuthContext sang Zustand

## 🎯 Mục tiêu
Migrate authentication state management từ Context API sang Zustand

---

## 📋 Checklist

### 1️⃣ Chuẩn bị
- [ ] Đọc file `ZUSTAND_GUIDE.md` để hiểu lý thuyết
- [ ] Backup code hiện tại (commit git)
- [ ] Cài đặt Zustand: `yarn add zustand`

### 2️⃣ Tạo Auth Store
- [ ] Tạo file `src/stores/authStore.ts`
- [ ] Copy interface `AuthStore` từ guide
- [ ] Implement các actions:
  - [ ] `login()`
  - [ ] `logout()`
  - [ ] `checkAuth()`
  - [ ] `register()`
- [ ] Test store độc lập (console.log)

### 3️⃣ Sửa Entry Point
- [ ] File: `src/main.tsx`
  - [ ] Bỏ import `AuthProvider`
  - [ ] Bỏ `<AuthProvider>` wrapper
  - [ ] Tạo component `AppWrapper`
  - [ ] Gọi `checkAuth()` trong `useEffect`

### 4️⃣ Migrate Components (11 files)

#### Core Components
- [ ] `src/App.tsx`
  - [ ] Import `useAuthStore` 
  - [ ] Đổi `const { user } = useAuth()` → `const user = useAuthStore(state => state.user)`
  
- [ ] `src/header.tsx`
  - [ ] Import từ `stores/authStore` và `context/authUtils`
  - [ ] Tách thành 3 dòng separate:
    ```typescript
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const isLecturer = user?.role === UserRole.LECTURER;
    ```

- [ ] `src/sidebar.tsx`
  - [ ] Tương tự header
  - [ ] `const user = useAuthStore(state => state.user)`

- [ ] `src/LecturerApp.tsx`
  - [ ] `const user = useAuthStore(state => state.user)`

#### Auth Pages
- [ ] `src/pages/LoginPage.tsx`
  - [ ] `const login = useAuthStore(state => state.login)`

- [ ] `src/pages/RegisterPage.tsx`
  - [ ] `const register = useAuthStore(state => state.register)`

#### Route Guards
- [ ] `src/components/ProtectedRoute.tsx`
  - [ ] 2 selectors riêng cho `user` và `isLoading`
  - [ ] Tính `isAuthenticated = !!user` trong component

- [ ] `src/components/RoleBasedRoute.tsx`
  - [ ] 2 selectors riêng cho `user` và `isLoading`

- [ ] `src/components/RoleRedirect.tsx`
  - [ ] `const user = useAuthStore(state => state.user)`

#### Router
- [ ] `src/router/index.tsx`
  - [ ] Import `UserRole` từ `context/authUtils` (không đổi)

### 5️⃣ Test chức năng
- [ ] Chạy app: `yarn dev`
- [ ] Test đăng nhập
  - [ ] Nhập email/password đúng → redirect về trang chủ
  - [ ] Nhập sai → hiện error
- [ ] Test đăng ký
  - [ ] Đăng ký student → thành công
  - [ ] Đăng ký lecturer → thành công
- [ ] Test đăng xuất
  - [ ] Click logout → redirect về login
- [ ] Test protected routes
  - [ ] Chưa login vào `/student` → redirect về `/login`
  - [ ] Đã login → hiển thị đúng
- [ ] Test role-based routing
  - [ ] Student vào `/lecturer` → redirect về `/student`
  - [ ] Lecturer vào `/student` → redirect về `/lecturer`
- [ ] Test refresh page
  - [ ] Refresh khi đã login → vẫn giữ login
  - [ ] Token hết hạn → logout tự động

### 6️⃣ Dọn dẹp (Optional)
- [ ] **CHƯA XÓA** `src/context/AuthContext.tsx` (giữ để so sánh)
- [ ] **GIỮ LẠI** `src/context/authUtils.ts` (vẫn dùng cho types)
- [ ] Commit code: `git commit -m "Migrate from Context API to Zustand"`

---

## 🐛 Troubleshooting nhanh

### Vấn đề: Component không re-render
```typescript
// ❌ Sai
const isAuth = useAuthStore(state => state.isAuthenticated);

// ✅ Đúng
const user = useAuthStore(state => state.user);
const isAuth = !!user;
```

### Vấn đề: TypeScript error
```typescript
// ✅ Đảm bảo có generic type
export const useAuthStore = create<AuthStore>((set, get) => ({...}));
```

### Vấn đề: Login thành công nhưng không navigate
```typescript
// ✅ Kiểm tra set() được gọi trong login action
set({ user: normalized, isLoading: false });
```

---

## 📊 So sánh trước/sau

### Trước (Context API)
```typescript
// main.tsx
<AuthProvider>
  <App />
</AuthProvider>

// Component
const { user, login, logout } = useAuth();
```

### Sau (Zustand)
```typescript
// main.tsx
<AppWrapper /> // Không cần Provider

// Component
const user = useAuthStore(state => state.user);
const login = useAuthStore(state => state.login);
const logout = useAuthStore(state => state.logout);
```

---

## ✨ Lợi ích đạt được

- [x] **Code ngắn hơn** ~30%
- [x] **Performance tốt hơn** (selective re-render)
- [x] **TypeScript tốt hơn** (auto infer)
- [x] **Testing dễ hơn** (no Provider needed)
- [x] **DevTools** (Redux DevTools)

---

## 📚 Tài liệu

- Chi tiết: Xem file `ZUSTAND_GUIDE.md`
- Official: https://github.com/pmndrs/zustand

---

🎉 **Chúc bạn migration thành công!**

