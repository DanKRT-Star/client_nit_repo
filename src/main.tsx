import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import router from './router/index'
import { useAuthStore } from './stores/authStore'
import { queryClient } from './config/queryClient'

// Component wrapper để gọi checkAuth khi app load
function AppWrapper() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWrapper/>
    </QueryClientProvider>
  </StrictMode>,
)