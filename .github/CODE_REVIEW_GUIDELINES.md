# Code Review Guidelines - Senior React Developer Standards

Hướng dẫn này dành cho reviewers (bao gồm cả CodeRabbit AI) khi review code.

## 🎯 Mục tiêu Code Review

1. Đảm bảo code quality và maintainability
2. Phát hiện bugs và security issues sớm
3. Chia sẻ kiến thức trong team
4. Maintain coding standards nhất quán

## 📋 Review Checklist

### 🔴 CRITICAL - Phải fix trước khi merge

#### 1. Security Vulnerabilities
- [ ] Không có XSS vulnerabilities (đặc biệt với `dangerouslySetInnerHTML`)
- [ ] Không có CSRF vulnerabilities
- [ ] API keys, tokens không bị hardcode
- [ ] User input được validate và sanitize
- [ ] Không có SQL injection (nếu có backend code)

#### 2. Performance Killers
- [ ] Heavy components được wrap với `React.memo`
- [ ] Expensive calculations sử dụng `useMemo`
- [ ] Event handlers sử dụng `useCallback`
- [ ] Không có infinite loops trong `useEffect`
- [ ] `useEffect` có cleanup function khi cần (subscriptions, timers, etc.)
- [ ] Không có unnecessary re-renders

#### 3. Type Safety
- [ ] Không sử dụng `any` type (trừ khi thực sự cần thiết)
- [ ] Props có proper TypeScript types
- [ ] Không có unsafe type assertions

### 🟡 IMPORTANT - Nên fix

#### 4. React Best Practices
- [ ] Components không quá lớn (khuyến nghị < 300 lines)
- [ ] Logic phức tạp được tách ra custom hooks
- [ ] Không có deep props drilling (> 3 levels → dùng Context)
- [ ] Lists có `key` props unique và stable
- [ ] Không có side effects trong render phase
- [ ] Loading và error states được handle đúng cách

#### 5. Code Organization
- [ ] File structure rõ ràng, dễ tìm
- [ ] Tên biến/function descriptive (không dùng `x`, `temp`, `data`)
- [ ] Không có magic numbers/strings (dùng constants)
- [ ] Không duplicate code (DRY principle)
- [ ] Complex logic có JSDoc comments

#### 6. Accessibility (a11y)
- [ ] Images có `alt` text
- [ ] Sử dụng semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- [ ] Interactive elements có ARIA labels khi cần
- [ ] Keyboard navigation hoạt động tốt (tab, enter, esc)
- [ ] Color contrast đủ (WCAG AA: 4.5:1)

#### 7. Error Handling
- [ ] Async operations có try-catch
- [ ] Components có Error Boundaries
- [ ] Errors được log properly
- [ ] User-friendly error messages (không show technical errors cho users)

### 🟢 NICE TO HAVE - Gợi ý cải thiện

#### 8. Modern React Patterns
- [ ] Sử dụng functional components + hooks (không dùng class)
- [ ] Composition over inheritance
- [ ] Consider render props hoặc compound components khi phù hợp

#### 9. Code Style & Consistency
- [ ] Consistent naming: `camelCase` cho variables/functions, `PascalCase` cho components
- [ ] Component files: `ComponentName.tsx`
- [ ] Import ordering: external → internal → relative → styles
- [ ] ESLint/Prettier compliant

#### 10. Testing
- [ ] Code có testable không? (loose coupling, dependency injection)
- [ ] Edge cases được cover?
- [ ] Mocks reasonable?

#### 11. Bundle Optimization
- [ ] Components có thể lazy load được không?
- [ ] Có opportunities cho code splitting?
- [ ] Dependencies có tree-shakable không?

## 💬 Cách Comment Review

### Good Examples:

✅ **[CRITICAL] Missing useEffect dependency**
```typescript
// Current
useEffect(() => {
  fetchData(userId);
}, []); // ❌ userId không có trong deps

// Suggestion
useEffect(() => {
  fetchData(userId);
}, [userId]); // ✅ Add userId vào dependency array
```
**Impact:** Stale closure → data không refresh khi userId thay đổi → user thấy wrong data

---

✅ **[IMPORTANT] Component quá lớn, nên split**

Component `UserDashboard.tsx` có 450 lines, khó maintain.

**Suggestion:** Tách thành:
- `UserProfile.tsx` - Profile section
- `UserStats.tsx` - Statistics
- `UserActivity.tsx` - Activity feed
- `UserDashboard.tsx` - Container component

**Benefit:** Easier to test, maintain, và reuse

---

✅ **Good job!** 👍

Việc sử dụng `useMemo` ở đây giúp avoid expensive recalculation. Clean code!

### Bad Examples:

❌ Quá chung chung:
> "Code này không tốt, nên refactor"

❌ Không giải thích:
> "Đổi thành `useMemo`"

❌ Quá harsh:
> "Code này sai hoàn toàn, viết lại đi"

## 🎓 Senior Developer Mindset

Khi review, hãy nhớ:

1. **Empathy First**
   - Mọi người đều làm sai, focus vào code không phải người
   - Khen khi thấy code tốt
   - Giải thích rõ ràng, đừng assume ai cũng biết

2. **Teach, Don't Just Point**
   - Giải thích TẠI SAO, không chỉ NÊN
   - Provide examples cụ thể
   - Share articles/docs khi cần

3. **Prioritize**
   - Critical issues → block merge
   - Important issues → discussion
   - Nice-to-have → optional suggestions

4. **Balance**
   - Don't be too picky về style (trust ESLint/Prettier)
   - Focus vào logic, security, performance
   - Không demand perfection, code có thể improve dần

5. **Context Matters**
   - Hotfix có thể skip một số best practices
   - Prototypes không cần perfect
   - Production code phải strict hơn

## 🤖 Tips cho CodeRabbit AI

Tag `@coderabbitai` trong PR comments để:

```
@coderabbitai giải thích logic của function này
@coderabbitai có performance issues không?
@coderabbitai suggest refactor cho clean hơn
@coderabbitai viết unit test cho component này
```

## 📚 Resources

- [React Docs - Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Performance Optimization](https://react.dev/reference/react/memo)

---

Happy reviewing! 🚀
