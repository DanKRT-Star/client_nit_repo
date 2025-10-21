import './App.css'
import { Outlet, useLocation } from 'react-router'
import Header from './header'
import Sidebar from './sidebar'
import Footer from './footer'
import { useState } from 'react'

export default function App() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='font-opens text-sm flex flex-col h-full max-w-[1500px] mx-auto bg-surface'>
        
        <Header 
          currentPage={location.pathname}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className=' flex-1 relative overflow-auto'>
          <div className='flex'>
            <Sidebar 
              currentPage={location.pathname}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            
            <div className="main p-4 md:p-6 h-fit flex-1 flex-col gap-5">
                <Outlet />
            </div>
          </div>
            <Footer />
        </main>
    </div>
  )
}

