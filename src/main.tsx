import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import router from './router/index'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)