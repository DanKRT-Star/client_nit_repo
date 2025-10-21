import './App.css'
import { Outlet, useLocation} from 'react-router'
import Header from './header'
import Sidebar from './sidebar'
import Footer from './footer'

export default function App() {
  const location = useLocation();

  return (
    <div className='font-opens flex flex-col h-full max-w-[1500px] mx-auto bg-background overflow-hidden'>

        <Header currentPage={location.pathname}/>  
        <main className=' flex-1 relative overflow-auto'>
          <div className='flex'>
            <Sidebar 
              currentPage={location.pathname}
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
