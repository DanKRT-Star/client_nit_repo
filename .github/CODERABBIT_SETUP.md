# Hướng dẫn setup CodeRabbit - AI Code Review tự động

CodeRabbit là AI bot sẽ tự động review code mỗi khi bạn tạo Pull Request.

## Tính năng của CodeRabbit:

- ✅ **Auto review mỗi PR** - Phân tích code và đưa ra suggestions
- ✅ **Security checks** - Phát hiện lỗi bảo mật
- ✅ **Code quality** - Gợi ý cải thiện code
- ✅ **Comment trực tiếp** - Comment ngay trên dòng code có vấn đề
- ✅ **Chat với AI** - Hỏi đáp về code trong PR
- ✅ **Miễn phí 100%** cho public repositories
- ✅ **Free trial** cho private repos (sau đó $12/month)

## Bước 1: Đăng ký CodeRabbit

1. Truy cập [https://coderabbit.ai](https://coderabbit.ai)
2. Click **"Sign in with GitHub"**
3. Authorize CodeRabbit truy cập GitHub account
4. Chọn **Free plan** (cho public repos) hoặc **Trial** (cho private repos)

## Bước 2: Cài đặt CodeRabbit vào Repository

### Cách 1: Từ CodeRabbit Dashboard

1. Sau khi đăng nhập, vào [https://app.coderabbit.ai](https://app.coderabbit.ai)
2. Click **"Add Repository"**
3. Chọn repository của bạn (ví dụ: `nguyenchitue/lesson`)
4. Click **"Install"**
5. Xong! 🎉

### Cách 2: Từ GitHub Marketplace

1. Vào [GitHub Marketplace - CodeRabbit](https://github.com/marketplace/coderabbitai)
2. Click **"Set up a plan"**
3. Chọn **Free** (cho public repos)
4. Click **"Install it for free"**
5. Chọn repositories muốn enable
6. Click **"Install"**

## Bước 3: Cấu hình CodeRabbit (Optional)

Tạo file `.coderabbit.yaml` trong repo để tùy chỉnh:

```yaml
# File này đã được tạo sẵn ở .coderabbit.yaml
```

Xem file [.coderabbit.yaml](.coderabbit.yaml) để biết cấu hình chi tiết.

## Bước 4: Test CodeRabbit

1. Tạo một Pull Request bất kỳ:
   ```bash
   git checkout -b test-coderabbit
   # Sửa một file bất kỳ
   git add .
   git commit -m "Test CodeRabbit"
   git push -u origin test-coderabbit
   ```

2. Tạo PR trên GitHub từ branch `test-coderabbit` → `dev`

3. Đợi vài giây, CodeRabbit sẽ:
   - Comment tổng quan về PR
   - Review từng file thay đổi
   - Comment suggestions trực tiếp trên code
   - Đánh giá code quality

## Cách sử dụng CodeRabbit

### 1. Auto Review
Mỗi khi tạo PR, CodeRabbit tự động:
- Phân tích tất cả thay đổi
- Comment suggestions
- Highlight potential issues
- Rate code quality

### 2. Chat với CodeRabbit trong PR
Bạn có thể tag `@coderabbitai` trong comment:

```
@coderabbitai hãy giải thích đoạn code này
@coderabbitai có bug nào không?
@coderabbitai refactor đoạn này cho clean hơn
@coderabbitai viết unit test cho function này
```

### 3. Commands

Comment các commands này trong PR:

- `@coderabbitai pause` - Tạm dừng review cho PR này
- `@coderabbitai resume` - Tiếp tục review
- `@coderabbitai review` - Review lại toàn bộ PR
- `@coderabbitai resolve` - Đánh dấu conversation đã resolve
- `@coderabbitai configuration` - Xem cấu hình hiện tại

### 4. React với suggestions

CodeRabbit sẽ comment suggestions dạng:

```diff
- const result = data.map(x => x.value)
+ const result = data.map(item => item.value)
```

Bạn có thể:
- Click **"Commit suggestion"** để apply ngay
- Reply để discuss
- React 👍/👎 để feedback

## Tính năng nâng cao

### 1. Tích hợp với Slack

Nhận thông báo khi CodeRabbit review xong:

1. Vào CodeRabbit Settings
2. Chọn **Integrations** → **Slack**
3. Connect Slack workspace
4. Chọn channel nhận thông báo

### 2. Custom Review Rules

Trong file `.coderabbit.yaml`:

```yaml
reviews:
  # Chỉ review những file này
  path_filters:
    - "src/**/*.ts"
    - "src/**/*.tsx"

  # Bỏ qua những file này
  path_instructions:
    - path: "**/*.test.ts"
      instructions: "Don't review test files"

  # Custom instructions
  auto_review:
    enabled: true
    drafts: false  # Không review draft PRs
```

### 3. Team Settings

Nếu có nhiều members:

1. Vào CodeRabbit Dashboard
2. Settings → Team
3. Invite members
4. Set review policies

## Pricing (Tham khảo)

- **Free**: Public repositories
- **Pro ($12/user/month)**: Private repos, unlimited reviews
- **Enterprise**: Custom pricing, advanced features

Với 2 members, nếu dùng private repo:
- **$24/tháng** cho 2 người
- Hoặc dùng **Free trial 14 ngày** để test

## So sánh với các công cụ khác

| Tính năng | CodeRabbit | GitHub Copilot | SonarQube |
|-----------|------------|----------------|-----------|
| AI Review | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Auto comment | ✅ | ❌ | ✅ |
| Chat với AI | ✅ | ✅ | ❌ |
| Free cho public | ✅ | ❌ | ✅ |
| Setup dễ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Security scan | ✅ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Troubleshooting

### CodeRabbit không comment gì
- Kiểm tra CodeRabbit đã được install vào repo chưa
- Kiểm tra PR có quá nhỏ không (< 5 dòng thay đổi)
- Check Settings → Enable auto-review

### Comment quá nhiều
- Adjust sensitivity trong `.coderabbit.yaml`
- Set `review_comments_limit: 10`

### Muốn pause cho một PR
- Comment `@coderabbitai pause` trong PR

### Không review file test
- Thêm vào `.coderabbit.yaml`:
  ```yaml
  path_instructions:
    - path: "**/*.test.ts"
      instructions: "Skip this file"
  ```

## Tips

1. **Review trước khi tạo PR**: Dùng local AI tools (Copilot) trước
2. **Đọc kỹ suggestions**: CodeRabbit có thể sai, cần verify
3. **Tận dụng chat**: Hỏi CodeRabbit giải thích code phức tạp
4. **Combine với human review**: AI + human = tốt nhất
5. **Set rules rõ ràng**: Càng specific càng tốt

## Kết hợp CodeRabbit + Slack

Workflow hoàn chỉnh:

1. Developer push code → GitHub
2. Tạo PR
3. **CodeRabbit auto review** → comment suggestions
4. **Slack notify** về PR mới (workflow đã tạo)
5. Team member xem Slack → click vào PR
6. Đọc CodeRabbit comments
7. Review thêm + approve
8. Merge PR
9. **Slack notify** PR merged

Perfect! 🚀

## Tham khảo

- [CodeRabbit Documentation](https://docs.coderabbit.ai)
- [CodeRabbit GitHub](https://github.com/coderabbitai)
- [Configuration Guide](https://docs.coderabbit.ai/guides/configure-coderabbit)

---

**Lưu ý**: Repo của bạn là **private hay public**?
- **Public** → Hoàn toàn miễn phí ✅
- **Private** → Free trial 14 ngày, sau đó $12/user/month
