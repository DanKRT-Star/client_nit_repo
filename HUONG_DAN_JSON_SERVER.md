# Hướng Dẫn Sử Dụng JSON Server

## Giới Thiệu
JSON Server là một công cụ giúp tạo một REST API giả lập nhanh chóng chỉ với một file JSON. Rất hữu ích cho việc học tập, prototype và phát triển frontend khi chưa có backend thực tế.

## Cài Đặt

### Cài đặt global (khuyến nghị cho học tập)
```bash
npm install -g json-server
```

### Cài đặt local trong project
```bash
npm install --save-dev json-server
```

## Cách Sử Dụng Cơ Bản

### Bước 1: Tạo file dữ liệu JSON
Tạo file `db.json` với cấu trúc dữ liệu mẫu:

```json
{
  "users": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "a@example.com",
      "age": 25
    },
    {
      "id": 2,
      "name": "Trần Thị B",
      "email": "b@example.com",
      "age": 30
    }
  ],
  "products": [
    {
      "id": 1,
      "name": "Laptop Dell",
      "price": 15000000,
      "category": "electronics"
    },
    {
      "id": 2,
      "name": "iPhone 15",
      "price": 25000000,
      "category": "electronics"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Thiết bị điện tử"
    },
    {
      "id": 2,
      "name": "Books",
      "description": "Sách và tài liệu"
    }
  ]
}
```

### Bước 2: Khởi động JSON Server
```bash
json-server --watch db.json --port 3000
```

Hoặc với cấu hình mặc định:
```bash
json-server db.json
```

## Các Endpoint Tự Động Được Tạo

Khi khởi động, JSON Server sẽ tự động tạo các endpoint REST API đầy đủ:

### 1. GET - Lấy danh sách
```
GET http://localhost:3000/users
GET http://localhost:3000/products
GET http://localhost:3000/categories
```

### 2. GET - Lấy một item theo ID
```
GET http://localhost:3000/users/1
GET http://localhost:3000/products/2
```

### 3. POST - Thêm mới
```
POST http://localhost:3000/users
Content-Type: application/json

{
  "name": "Lê Văn C",
  "email": "c@example.com",
  "age": 28
}
```

### 4. PUT - Cập nhật toàn bộ
```
PUT http://localhost:3000/users/1
Content-Type: application/json

{
  "name": "Nguyễn Văn A Updated",
  "email": "a_new@example.com",
  "age": 26
}
```

### 5. PATCH - Cập nhật một phần
```
PATCH http://localhost:3000/users/1
Content-Type: application/json

{
  "age": 27
}
```

### 6. DELETE - Xóa
```
DELETE http://localhost:3000/users/1
```

## Tính Năng Nâng Cao

### 1. Filtering (Lọc)
```
GET http://localhost:3000/products?category=electronics
GET http://localhost:3000/users?age=25
```

### 2. Pagination (Phân trang)
```
GET http://localhost:3000/products?_page=1&_limit=10
```

### 3. Sorting (Sắp xếp)
```
GET http://localhost:3000/products?_sort=price&_order=asc
GET http://localhost:3000/products?_sort=price&_order=desc
```

### 4. Full-text Search (Tìm kiếm)
```
GET http://localhost:3000/products?q=laptop
```

### 5. Operators (Toán tử)
```
GET http://localhost:3000/products?price_gte=10000000
GET http://localhost:3000/products?price_lte=20000000
GET http://localhost:3000/users?age_ne=25
```

Các toán tử:
- `_gte`: greater than or equal (>=)
- `_lte`: less than or equal (<=)
- `_ne`: not equal (!=)
- `_like`: tìm kiếm với regex

### 6. Relationships (Quan hệ)
Thêm quan hệ vào `db.json`:

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Bài viết 1",
      "content": "Nội dung bài viết",
      "userId": 1
    }
  ],
  "comments": [
    {
      "id": 1,
      "body": "Comment hay",
      "postId": 1,
      "userId": 2
    }
  ]
}
```

Truy vấn với quan hệ:
```
GET http://localhost:3000/posts/1/comments
GET http://localhost:3000/users/1/posts
```

## Cấu Hình Nâng Cao

### 1. Tạo file cấu hình `json-server.json`
```json
{
  "port": 3001,
  "host": "localhost",
  "watch": true,
  "delay": 1000,
  "static": "./public",
  "read-only": false
}
```

### 2. Sử dụng với file routes tùy chỉnh
Tạo file `routes.json`:
```json
{
  "/api/v1/*": "/$1",
  "/users/:id/avatar": "/avatars/:id"
}
```

Chạy với routes:
```bash
json-server db.json --routes routes.json
```

### 3. Thêm middleware tùy chỉnh
Tạo file `server.js`:
```javascript
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Custom middleware
server.use((req, res, next) => {
  console.log('Request URL:', req.url)
  console.log('Request Method:', req.method)
  next()
})

// Add custom routes
server.get('/custom-endpoint', (req, res) => {
  res.json({ message: 'Custom endpoint response' })
})

server.use(middlewares)
server.use(router)

const PORT = 3000
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`)
})
```

Chạy:
```bash
node server.js
```

## Tích Hợp Với Frontend

### 1. Sử Dụng với Fetch API
```javascript
// GET - Lấy danh sách users
fetch('http://localhost:3000/users')
  .then(response => response.json())
  .then(data => console.log(data))

// POST - Thêm user mới
fetch('http://localhost:3000/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'User mới',
    email: 'new@example.com',
    age: 22
  })
})
  .then(response => response.json())
  .then(data => console.log(data))

// PUT - Cập nhật user
fetch('http://localhost:3000/users/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated Name',
    email: 'updated@example.com',
    age: 30
  })
})
  .then(response => response.json())
  .then(data => console.log(data))

// DELETE - Xóa user
fetch('http://localhost:3000/users/1', {
  method: 'DELETE'
})
  .then(response => response.json())
  .then(data => console.log('Deleted successfully'))
```

### 2. Sử Dụng với Axios
```javascript
import axios from 'axios'

const API_URL = 'http://localhost:3000'

// GET
const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`)
    return response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

// POST
const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData)
    return response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

// PUT
const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData)
    return response.data
  } catch (error) {
    console.error('Error:', error)
  }
}

// DELETE
const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_URL}/users/${userId}`)
    console.log('User deleted successfully')
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## Scripts trong package.json

Thêm vào `package.json` để dễ sử dụng:

```json
{
  "scripts": {
    "server": "json-server --watch db.json --port 3000",
    "server:delay": "json-server --watch db.json --port 3000 --delay 1000",
    "server:readonly": "json-server --watch db.json --port 3000 --read-only"
  }
}
```

Sau đó chạy:
```bash
npm run server
```

## Lưu Ý Quan Trọng

1. **ID tự động**: JSON Server tự động tạo ID khi POST nếu không cung cấp
2. **Validation**: Không có validation mặc định, cần tự thêm middleware
3. **Authentication**: Không có authentication mặc định
4. **CORS**: Được bật mặc định, có thể truy cập từ mọi origin
5. **Persistence**: Dữ liệu được lưu trực tiếp vào file `db.json`
6. **Production**: Chỉ dùng cho development, không dùng cho production

## Bài Tập Thực Hành

### Bài 1: Tạo API quản lý sản phẩm
1. Tạo file `products.json` với các trường: id, name, price, quantity, category
2. Khởi động server
3. Thực hiện CRUD operations
4. Thêm filtering và sorting

### Bài 2: Tạo API Blog
1. Tạo 3 collections: posts, comments, users
2. Thiết lập relationships
3. Implement pagination
4. Thêm full-text search

### Bài 3: Tích hợp với React/Vue
1. Tạo một ứng dụng frontend
2. Kết nối với JSON Server
3. Hiển thị danh sách
4. Thêm form create/update
5. Implement delete với confirmation

## Tài Liệu Tham Khảo

- [JSON Server GitHub](https://github.com/typicode/json-server)
- [JSON Server NPM](https://www.npmjs.com/package/json-server)
- [REST API Best Practices](https://restfulapi.net/)

## Troubleshooting

### Lỗi thường gặp và cách khắc phục

1. **Port đã được sử dụng**
   - Thay đổi port: `json-server --watch db.json --port 3001`

2. **CORS errors**
   - Thêm headers trong custom server
   - Sử dụng proxy trong frontend

3. **File db.json bị corrupt**
   - Backup file trước khi test
   - Validate JSON syntax

4. **Performance chậm với data lớn**
   - Giới hạn data test
   - Sử dụng pagination
   - Consider sử dụng database thực

---

**Happy Coding! 🚀**