# Hướng dẫn cấu hình Slack Notifications cho GitHub

Workflow này sẽ tự động gửi thông báo đẹp mắt đến Slack channel khi:
- Có commit mới được push lên bất kỳ branch nào
- Có Pull Request được tạo, cập nhật, đóng hoặc merge

## Bước 1: Tạo Slack Webhook (Cực kỳ đơn giản!)

### Cách 1: Sử dụng Incoming Webhook (Khuyến nghị - Dễ nhất)

1. Vào workspace Slack của bạn
2. Truy cập: [https://api.slack.com/apps](https://api.slack.com/apps)
3. Click **"Create New App"**
4. Chọn **"From scratch"**
5. Đặt tên app (ví dụ: "GitHub Notifications")
6. Chọn workspace của bạn
7. Click **"Create App"**

8. Trong màn hình app settings:
   - Chọn **"Incoming Webhooks"** từ menu bên trái
   - Toggle **"Activate Incoming Webhooks"** thành ON
   - Click **"Add New Webhook to Workspace"**
   - Chọn channel muốn nhận thông báo (ví dụ: #github-notifications)
   - Click **"Allow"**

9. Copy **Webhook URL** (có dạng: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)

### Cách 2: Nếu bạn đã có Slack App

1. Vào [Slack Apps](https://api.slack.com/apps)
2. Chọn app của bạn
3. Vào **Incoming Webhooks**
4. Click **Add New Webhook to Workspace**
5. Copy Webhook URL

## Bước 2: Cấu hình GitHub Secret

1. Vào repository GitHub của bạn
2. Vào **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Thêm secret:
   - Name: `SLACK_WEBHOOK_URL`
   - Value: Webhook URL bạn vừa copy (dạng `https://hooks.slack.com/services/...`)
5. Click **"Add secret"**

## Bước 3: Test Workflow

1. Push một commit bất kỳ:
   ```bash
   git add .
   git commit -m "Test Slack notification"
   git push
   ```

2. Hoặc tạo một Pull Request

3. Kiểm tra:
   - Tab **Actions** trên GitHub để xem workflow chạy
   - Channel Slack để xem thông báo

## Tính năng của Workflow

### Thông báo Push Commit bao gồm:
- Repository name
- Branch name
- Tên tác giả
- Commit SHA
- Commit message
- Nút "View Commit" và "View Repository"

### Thông báo Pull Request bao gồm:
- Repository name
- PR number
- Tên tác giả
- Branches (source → target)
- PR title và description
- Số dòng thêm/xóa/files thay đổi
- Nút "View Pull Request" và "View Changes"
- Icon khác nhau cho mỗi loại event:
  - 🔔 New PR Opened
  - 🔄 PR Reopened
  - 🔃 PR Updated
  - ✅ PR Merged
  - ❌ PR Closed

## Tùy chỉnh Workflow

### Chỉ gửi thông báo cho branch cụ thể

Sửa file `.github/workflows/slack-notification.yml`:

```yaml
on:
  push:
    branches:
      - main
      - develop
```

### Thay đổi channel nhận thông báo

1. Vào Slack App settings
2. Vào **Incoming Webhooks**
3. Xóa webhook cũ và tạo webhook mới với channel khác
4. Cập nhật `SLACK_WEBHOOK_URL` secret trên GitHub

### Tùy chỉnh giao diện thông báo

Sửa phần `payload` trong workflow file. Slack sử dụng [Block Kit](https://api.slack.com/block-kit) để render tin nhắn.

Bạn có thể dùng [Block Kit Builder](https://app.slack.com/block-kit-builder) để design và test giao diện.

### Thêm thông tin khác

Ví dụ thêm reviewer vào thông báo PR:

```yaml
{
  "type": "mrkdwn",
  "text": "*Reviewers:*\n${{ join(github.event.pull_request.requested_reviewers.*.login, ', ') }}"
}
```

### Thêm mentions

Để mention user hoặc channel trong thông báo:

```yaml
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "Hey <@USER_ID> or <!channel>, có PR mới cần review!"
  }
}
```

## Gửi đến nhiều channels

Nếu muốn gửi đến nhiều channel:

1. Tạo nhiều webhooks cho các channel khác nhau
2. Thêm nhiều secrets: `SLACK_WEBHOOK_URL_DEV`, `SLACK_WEBHOOK_URL_PROD`, etc.
3. Tạo nhiều steps trong workflow:

```yaml
- name: Notify Dev Channel
  uses: slackapi/slack-github-action@v1.26.0
  with:
    payload: |
      { ... }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL_DEV }}
    SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK

- name: Notify Prod Channel
  if: github.ref == 'refs/heads/main'
  uses: slackapi/slack-github-action@v1.26.0
  with:
    payload: |
      { ... }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL_PROD }}
    SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

## Troubleshooting

### Lỗi "invalid_payload"
- Kiểm tra format JSON trong payload
- Đảm bảo không có ký tự đặc biệt chưa được escape

### Không nhận được thông báo
- Kiểm tra workflow có chạy thành công ở tab Actions
- Kiểm tra secret `SLACK_WEBHOOK_URL` có đúng không
- Kiểm tra webhook URL còn valid không (có thể bị revoke)

### Thông báo bị thiếu thông tin
- Một số field có thể null, cần check và provide default value
- Ví dụ: `${{ github.event.pull_request.body || '_No description_' }}`

### Webhook URL bị lộ
- KHÔNG bao giờ commit webhook URL vào code
- Nếu bị lộ, vào Slack App settings và revoke webhook đó, tạo webhook mới

## So sánh với các nền tảng khác

| Tính năng | Slack | Discord | Telegram | Zalo |
|-----------|-------|---------|----------|------|
| Dễ setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Giao diện đẹp | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Tùy chỉnh | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Miễn phí | ✅ | ✅ | ✅ | ⚠️ Limited |
| Phổ biến (dev) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

## Tham khảo

- [Slack API Documentation](https://api.slack.com/messaging/webhooks)
- [Block Kit Builder](https://app.slack.com/block-kit-builder)
- [GitHub Actions for Slack](https://github.com/slackapi/slack-github-action)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Tips nâng cao

### 1. Gửi thông báo cho failed builds

```yaml
- name: Notify Build Failed
  if: failure()
  uses: slackapi/slack-github-action@v1.26.0
  with:
    payload: |
      {
        "text": "❌ Build failed for ${{ github.repository }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
    SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

### 2. Thêm thread cho discussions

Sử dụng Slack Bot Token thay vì webhook để có thể tạo threads và reply.

### 3. Interactive buttons

Tạo buttons để trigger GitHub Actions workflow ngay từ Slack (cần setup Slack Bot và API).

---

Chúc bạn setup thành công! 🚀
