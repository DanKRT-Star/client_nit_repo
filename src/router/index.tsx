import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import MentorApp from '../MentorApp';
import NotFound from '../pages/NotFound';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRoute from '../components/RoleBasedRoute';
import { UserRole } from '../context/AuthContext';
import RoleRedirect from '../components/RoleRedirect';

// Import các pages
import CoursePage from '../pages/coursePage';
import CalendarPage from '../pages/calendarPage';
import AssignmentPage from '../pages/assignmentPage';
import BlogPage from '../pages/blogPage';
import Lessons from '../pages/lessons';


const router = createBrowserRouter([
  // Public routes (không cần đăng nhập)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

    // Root redirect dựa vào role
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RoleRedirect />
      </ProtectedRoute>
    ),
  },

    // Student routes
  {
    path: '/student',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={[UserRole.STUDENT]}>
          <App />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/student/courses" replace /> },
      { path: 'courses', element: <CoursePage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'assignment', element: <AssignmentPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'lessons', element: <Lessons /> },
    ],
  },

    // Mentor routes
  {
    path: '/mentor',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={[UserRole.MENTOR]}>
          <MentorApp />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <div>Mentor Dashboard (Coming soon)</div> },
      { path: 'courses', element: <div>Quản lý khóa học</div> },
      { path: 'students', element: <div>Quản lý học viên</div> },
      { path: 'analytics', element: <div>Thống kê</div> },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFound />,
  }
]);



export default router;
