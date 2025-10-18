import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import CoursePage from './pages/coursePage'
import CalendarPage from './pages/calendarPage'
import AssignmentPage from './pages/assignmentPage'
import BlogPage from './pages/blogPage'
import Lessons from './pages/lessons'

export default function Router() {
  return (
    createBrowserRouter([
        {
            path: '/',
            element: <App />,
            children: [
              { path: 'courses', element: <CoursePage /> },
              { path: 'calendar', element: <CalendarPage /> },
              { path: 'assignment', element: <AssignmentPage /> },
              { path: 'blog', element: <BlogPage /> },
              { path: 'lessons', element: <Lessons /> }
            ]
        }
    ])
  )
}