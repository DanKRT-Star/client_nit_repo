import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import CoursePage from './pages/coursePage'
import CalendarPage from './pages/calendarPage'
import AssignmentPage from './pages/assignmentPage'
import BlogPage from './pages/blogPage'

export default function Router() {
  return (
    createBrowserRouter([
        {
            path: '/',
            element: <App />,
            children: [
              { index: true, element: <Navigate to="courses" replace />  },
              { path: 'courses', element: <CoursePage /> },
              { path: 'calendar', element: <CalendarPage /> },
              { path: 'assignment', element: <AssignmentPage /> },
              { path: 'blog', element: <BlogPage /> },
            ]
        }
    ])
  )
}