# Hướng Dẫn Sử Dụng React useEffect với CRUD Operations

## Giới Thiệu
useEffect là một React Hook cho phép thực hiện side effects trong functional components. Trong hướng dẫn này, chúng ta sẽ học cách sử dụng useEffect để gọi API và thực hiện các thao tác CRUD (Create, Read, Update, Delete).

## Kiến Thức Cần Thiết
- React Hooks cơ bản (useState, useEffect)
- JavaScript ES6+ (async/await, arrow functions, destructuring)
- Fetch API hoặc Axios
- JSON Server (xem file HUONG_DAN_JSON_SERVER.md)

## Setup Dự Án

### 1. Tạo React App
```bash
npx create-react-app react-crud-app
cd react-crud-app
npm install axios
```

### 2. Cấu Trúc Thư Mục
```
src/
  ├── components/
  │   ├── UserList.jsx
  │   ├── UserForm.jsx
  │   └── UserItem.jsx
  ├── services/
  │   └── api.js
  ├── hooks/
  │   └── useApi.js
  └── App.js
```

### 3. Setup JSON Server
Tạo file `db.json` trong thư mục root:
```json
{
  "users": [
    { "id": 1, "name": "Nguyễn Văn A", "email": "a@gmail.com", "age": 25 },
    { "id": 2, "name": "Trần Thị B", "email": "b@gmail.com", "age": 30 }
  ]
}
```

Thêm script vào `package.json`:
```json
{
  "scripts": {
    "server": "json-server --watch db.json --port 3001"
  }
}
```

## Phần 1: Cấu Hình API Service

### services/api.js
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods cho User
export const userApi = {
  // GET - Lấy danh sách users
  getAll: () => api.get('/users'),

  // GET - Lấy user theo ID
  getById: (id) => api.get(`/users/${id}`),

  // POST - Tạo user mới
  create: (userData) => api.post('/users', userData),

  // PUT - Cập nhật toàn bộ user
  update: (id, userData) => api.put(`/users/${id}`, userData),

  // PATCH - Cập nhật một phần user
  patch: (id, userData) => api.patch(`/users/${id}`, userData),

  // DELETE - Xóa user
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
```

## Phần 2: useEffect Cơ Bản - READ Operation

### Ví dụ 1: Lấy danh sách users khi component mount
```javascript
import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect để fetch data khi component mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array = chỉ chạy 1 lần

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      <h2>Danh sách Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
```

### Ví dụ 2: Lấy user theo ID với cleanup function
```javascript
import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';

function UserDetail({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Flag để tránh update state sau khi unmount

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userApi.getById(userId);

        // Chỉ update state nếu component vẫn mounted
        if (isMounted) {
          setUser(response.data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error:', error);
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchUser();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [userId]); // Re-run khi userId thay đổi

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Age: {user.age}</p>
    </div>
  );
}
```

## Phần 3: Complete CRUD Component

### App.js - Component chính với đầy đủ CRUD
```javascript
import React, { useState, useEffect } from 'react';
import { userApi } from './services/api';
import './App.css';

function App() {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });

  // 1. READ - Fetch users khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getAll();
      setUsers(response.data);
    } catch (err) {
      setError('Không thể tải danh sách users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. CREATE - Thêm user mới
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await userApi.create({
        ...formData,
        age: parseInt(formData.age)
      });

      // Cập nhật state với user mới
      setUsers([...users, response.data]);

      // Reset form
      setFormData({ name: '', email: '', age: '' });
      alert('Tạo user thành công!');
    } catch (err) {
      setError('Không thể tạo user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. UPDATE - Cập nhật user
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      setLoading(true);
      const response = await userApi.update(editingUser.id, {
        ...formData,
        age: parseInt(formData.age)
      });

      // Cập nhật user trong state
      setUsers(users.map(user =>
        user.id === editingUser.id ? response.data : user
      ));

      // Reset form và editing state
      setFormData({ name: '', email: '', age: '' });
      setEditingUser(null);
      alert('Cập nhật thành công!');
    } catch (err) {
      setError('Không thể cập nhật user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETE - Xóa user
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này?')) {
      return;
    }

    try {
      setLoading(true);
      await userApi.delete(id);

      // Xóa user khỏi state
      setUsers(users.filter(user => user.id !== id));
      alert('Xóa thành công!');
    } catch (err) {
      setError('Không thể xóa user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age.toString()
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', age: '' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="App">
      <h1>React CRUD với useEffect</h1>

      {error && <div className="error">{error}</div>}

      {/* Form Create/Update */}
      <div className="form-container">
        <h2>{editingUser ? 'Cập nhật User' : 'Thêm User Mới'}</h2>
        <form onSubmit={editingUser ? handleUpdate : handleCreate}>
          <input
            type="text"
            name="name"
            placeholder="Họ tên"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Tuổi"
            value={formData.age}
            onChange={handleInputChange}
            required
          />
          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {editingUser ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {editingUser && (
              <button type="button" onClick={handleCancel}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* User List */}
      <div className="user-list">
        <h2>Danh sách Users</h2>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Tuổi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Sửa</button>
                    <button onClick={() => handleDelete(user.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
```

## Phần 4: Custom Hook cho API Calls

### hooks/useApi.js - Custom hook tái sử dụng
```javascript
import { useState, useEffect } from 'react';

// Custom hook cho GET request
export const useFetch = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction();

        if (isMounted) {
          setData(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
};

// Custom hook cho mutations (POST, PUT, DELETE)
export const useMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
```

### Sử dụng Custom Hooks
```javascript
import React from 'react';
import { useFetch, useMutation } from '../hooks/useApi';
import { userApi } from '../services/api';

function UserManagement() {
  // Fetch users với custom hook
  const {
    data: users,
    loading,
    error,
    refetch
  } = useFetch(() => userApi.getAll(), []);

  // Mutations
  const createMutation = useMutation(userApi.create);
  const updateMutation = useMutation(userApi.update);
  const deleteMutation = useMutation(userApi.delete);

  const handleCreate = async (userData) => {
    try {
      await createMutation.mutate(userData);
      refetch(); // Refresh danh sách
      alert('Tạo thành công!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutate(id);
      refetch(); // Refresh danh sách
      alert('Xóa thành công!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* UI components */}
    </div>
  );
}
```

## Phần 5: Best Practices và Tips

### 1. Abort Controller để hủy request
```javascript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/users', {
        signal: controller.signal
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    }
  };

  fetchData();

  // Cleanup: hủy request khi component unmount
  return () => {
    controller.abort();
  };
}, []);
```

### 2. Debounce cho Search
```javascript
import { useState, useEffect } from 'react';

function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      } else {
        setResults([]);
      }
    }, 500); // Delay 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const searchUsers = async (term) => {
    try {
      const response = await fetch(`/api/users?q=${term}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* Display results */}
    </div>
  );
}
```

### 3. Pagination với useEffect
```javascript
function PaginatedUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]); // Re-fetch khi page thay đổi

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `/api/users?_page=${page}&_limit=${limit}`
      );
      const data = await response.json();

      // Lấy total count từ header
      const totalCount = response.headers.get('X-Total-Count');
      setTotalPages(Math.ceil(totalCount / limit));

      setUsers(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      {/* Display users */}
      <div className="pagination">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### 4. Loading States chi tiết
```javascript
function DetailedLoadingStates() {
  const [loadingStates, setLoadingStates] = useState({
    fetching: false,
    creating: false,
    updating: false,
    deleting: false
  });

  const setLoading = (type, value) => {
    setLoadingStates(prev => ({ ...prev, [type]: value }));
  };

  const fetchUsers = async () => {
    setLoading('fetching', true);
    try {
      // API call
    } finally {
      setLoading('fetching', false);
    }
  };

  const createUser = async (data) => {
    setLoading('creating', true);
    try {
      // API call
    } finally {
      setLoading('creating', false);
    }
  };

  return (
    <div>
      {loadingStates.fetching && <div>Đang tải danh sách...</div>}
      {loadingStates.creating && <div>Đang tạo user...</div>}
      {/* UI */}
    </div>
  );
}
```

## Phần 6: Error Handling nâng cao

### Centralized Error Handler
```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server trả về error
    switch (error.response.status) {
      case 400:
        return 'Dữ liệu không hợp lệ';
      case 401:
        return 'Không có quyền truy cập';
      case 404:
        return 'Không tìm thấy dữ liệu';
      case 500:
        return 'Lỗi server';
      default:
        return 'Đã xảy ra lỗi';
    }
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    return 'Không thể kết nối đến server';
  } else {
    // Lỗi khác
    return error.message || 'Đã xảy ra lỗi';
  }
};

// Sử dụng trong component
import { handleApiError } from '../utils/errorHandler';

const fetchUsers = async () => {
  try {
    const response = await userApi.getAll();
    setUsers(response.data);
  } catch (err) {
    const errorMessage = handleApiError(err);
    setError(errorMessage);

    // Optional: Show toast notification
    toast.error(errorMessage);
  }
};
```

## Phần 7: Testing useEffect

### Testing với React Testing Library
```javascript
// UserList.test.js
import { render, screen, waitFor } from '@testing-library/react';
import UserList from './UserList';
import { userApi } from '../services/api';

// Mock API
jest.mock('../services/api');

describe('UserList', () => {
  test('should fetch and display users', async () => {
    const mockUsers = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' }
    ];

    userApi.getAll.mockResolvedValue({ data: mockUsers });

    render(<UserList />);

    // Check loading state
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();

    // Wait for users to be displayed
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  test('should handle error', async () => {
    userApi.getAll.mockRejectedValue(new Error('API Error'));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/lỗi/i)).toBeInTheDocument();
    });
  });
});
```

## Phần 8: Optimization Techniques

### 1. Memoization với useMemo và useCallback
```javascript
import React, { useState, useEffect, useMemo, useCallback } from 'react';

function OptimizedUserList() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');

  // Memoize filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  // Memoize callback functions
  const handleDelete = useCallback(async (id) => {
    try {
      await userApi.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter users..."
      />
      {filteredUsers.map(user => (
        <UserItem
          key={user.id}
          user={user}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### 2. React Query Integration (Recommended)
```javascript
// npm install react-query
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userApi } from '../services/api';

function UsersWithReactQuery() {
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, error } = useQuery(
    'users',
    () => userApi.getAll().then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Create mutation
  const createMutation = useMutation(
    (userData) => userApi.create(userData),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries('users');
      },
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id) => userApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

## Common Pitfalls và Cách tránh

### 1. Infinite Loop
```javascript
// ❌ SAI - Infinite loop
useEffect(() => {
  fetchUsers();
}); // Thiếu dependency array

// ✅ ĐÚNG
useEffect(() => {
  fetchUsers();
}, []); // Empty array = chỉ chạy 1 lần
```

### 2. Race Condition
```javascript
// ❌ SAI - Có thể gây race condition
useEffect(() => {
  fetchUserDetails(userId);
}, [userId]);

// ✅ ĐÚNG - Sử dụng cleanup
useEffect(() => {
  let cancelled = false;

  const fetchData = async () => {
    const data = await fetchUserDetails(userId);
    if (!cancelled) {
      setUser(data);
    }
  };

  fetchData();

  return () => {
    cancelled = true;
  };
}, [userId]);
```

### 3. Memory Leak
```javascript
// ❌ SAI - Không cleanup subscription
useEffect(() => {
  const subscription = subscribeToUpdates((data) => {
    setData(data);
  });
}, []);

// ✅ ĐÚNG - Có cleanup
useEffect(() => {
  const subscription = subscribeToUpdates((data) => {
    setData(data);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Bài Tập Thực Hành

### Bài 1: Todo App với CRUD
1. Tạo Todo App với các chức năng:
   - Thêm todo
   - Đánh dấu completed
   - Sửa todo
   - Xóa todo
   - Filter theo status
2. Sử dụng JSON Server
3. Implement loading states
4. Handle errors properly

### Bài 2: Product Management
1. Tạo trang quản lý sản phẩm với:
   - CRUD operations
   - Search functionality
   - Pagination
   - Sorting
2. Sử dụng custom hooks
3. Implement optimistic updates

### Bài 3: Real-time Chat Simulation
1. Tạo chat app với:
   - Fetch messages mỗi 2 giây
   - Send message
   - Delete message
   - Edit message
2. Handle cleanup properly
3. Implement typing indicator

## Tài Liệu Tham Khảo

- [React useEffect Documentation](https://react.dev/reference/react/useEffect)
- [React Query](https://tanstack.com/query/latest)
- [SWR - Data Fetching Library](https://swr.vercel.app/)
- [Axios Documentation](https://axios-http.com/)
- [JSON Server](https://github.com/typicode/json-server)

## Conclusion

useEffect là một hook mạnh mẽ cho việc xử lý side effects trong React. Khi kết hợp với API calls, cần chú ý:

1. **Cleanup functions** để tránh memory leaks
2. **Dependency array** để control khi nào effect chạy
3. **Error handling** cho better UX
4. **Loading states** để user biết app đang làm gì
5. **Custom hooks** để tái sử dụng logic

Happy Coding! 🚀