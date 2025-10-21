import { Link } from "react-router";
import { useState, useEffect } from "react";

export default function Header({ currentPage } : {currentPage: string}) {
  const navItems = ['Courses', 'Calendar', 'Assignment', 'Blog'];
  const [isDark, setIsDark] = useState(false);

  // toggle dark mode
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  }

  // Load theme từ localStorage khi component mount
  useEffect(()=>{
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Lưu theme vào localStorage khi thay đổi
   useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  
  return (
    <header className="w-full flex justify-between items-center shadow-lg px-10">
      {/*Logo and navbar */}
      <div className="flex items-center gap-10">
        <Link to={`/`} className="flex justify-center items-center gap-2.5 mx-auto">
            <h1 className="text-3xl font-bold"><span className="text-primary">E</span>-learning</h1>
        </Link>

        <nav>
          <ul className="flex gap-8 items-center">
            {navItems.map((item) => {
              const path = item === 'Dashboard' ? '/' : `/${item.toLowerCase()}`;
              const isActive = currentPage === path;

              return (
                <li key={item}>
                  <Link 
                    to={path}
                    className={`py-5 px-4 block relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-primary transition-all ${
                      isActive 
                        ? 'after:scale-x-100 text-primary font-semibold' 
                        : 'after:scale-x-0 hover:text-primary'
                    }`}
                  >
                    {item}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/*Search bar */}      
      <div className="relative w-1/3">
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 border border-border rounded-full w-full"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
            </svg>
          </span>
      </div>

      {/*Avatar and button*/}
      <div className="flex items-center gap-6">
          <button className="w-fit text-primary">
            {/* Icon user */}
            <svg  xmlns="http://www.w3.org/2000/svg" width="30" height="30"  fill="currentColor" viewBox="0 0 24 24" >
              <path d="M12 2a5 5 0 1 0 0 10 5 5 0 1 0 0-10M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1"></path>
            </svg>
          </button>
          
          <button className="w-fit text-primary">
              {/* Icon notification */}
              <svg  xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24" >
                <path d="M19 12.59V10c0-3.22-2.18-5.93-5.14-6.74C13.57 2.52 12.85 2 12 2s-1.56.52-1.86 1.26C7.18 4.08 5 6.79 5 10v2.59L3.29 14.3a1 1 0 0 0-.29.71v2c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-2c0-.27-.11-.52-.29-.71zM14.82 20H9.18c.41 1.17 1.51 2 2.82 2s2.41-.83 2.82-2"></path>
              </svg>
          </button>

          {/* Button toggle Dark/Light mode */}
          <button
          onClick={toggleDarkMode}
          className="w-fit text-primary hover:text-primary-dark transition-colors"
          >
            {isDark ? (
              // Icon mặt trăng (Dark mode)
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ): (
              // Icon mặt trời (Light mode)
              <svg  xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24" >
                <path d="M12 17.01c2.76 0 5.01-2.25 5.01-5.01S14.76 6.99 12 6.99 6.99 9.24 6.99 12s2.25 5.01 5.01 5.01M12 9c1.66 0 3.01 1.35 3.01 3.01s-1.35 3.01-3.01 3.01-3.01-1.35-3.01-3.01S10.34 9 12 9M13 19h-2v3h2v-3M13 2h-2v3h2V2M2 11h3v2H2zM19 11h3v2h-3zM4.22 18.36l.71.71.71.71 1.06-1.06 1.06-1.06-.71-.71-.71-.71-1.06 1.06zM19.78 5.64l-.71-.71-.71-.71-1.06 1.06-1.06 1.06.71.71.71.71 1.06-1.06zM7.76 6.34 6.7 5.28 5.64 4.22l-.71.71-.71.71L5.28 6.7l1.06 1.06.71-.71zM16.24 17.66l1.06 1.06 1.06 1.06.71-.71.71-.71-1.06-1.06-1.06-1.06-.71.71z"></path>
              </svg>
            )}
            
          </button>
      </div>
    </header>
  );
}
