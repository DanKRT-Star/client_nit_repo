import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoMdSunny, IoMdMoon } from "react-icons/io";



interface HeaderProps {
  currentPage: string;
  onMenuClick: () => void;
}

export default function Header({ currentPage, onMenuClick }: HeaderProps) {
  const navItems = ["Courses", "Calendar", "Assignment", "Blog"];
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <header className="w-full sticky top-0 z-50 flex justify-between items-center shadow-lg px-4 md:px-10 py-3 bg-surface">
      {/* Left: Logo + Menu */}
      <div className="flex items-center gap-3 md:gap-10">
        {/* Hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="xl:hidden p-2 rounded-lg hover:bg-component"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.5 4.5c-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-1.45-1.1-3.55-1.5-5.5-1.5zM21 18.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-bold">
            SkillUp
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="hidden xl:block">
          <ul className="flex gap-8 items-center">
            {navItems.map((item) => {
              const path = `/${item.toLowerCase()}`;
              const isActive = currentPage === path;
              return (
                <li key={item}>
                  <Link
                    to={path}
                    className={`text-base font-medium transition-colors ${
                      isActive
                        ? "text-main font-semibold"
                        : "text-secondary hover:text-main hover:font-semibold"
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

      {/* Search bar */}
      <div className="relative flex-1 max-w-xs md:max-w-md mx-2 md:mx-10 rounded-lg">
        <input
          type="text"
          placeholder="Search.."
          className="pl-10 pr-4 py-2 bg-background border-none rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="p-2 rounded-lg text-main hover:bg-component transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <IoMdMoon className="w-6 h-6" />
          ) : (
            <IoMdSunny className="w-6 h-6" />
          )}
      </button>

        {/* Sign in */}
        <button className="bg-primary text-primary font-medium px-3 md:px-6 py-2 rounded-lg text-sm md:text-base">
          Sign In
        </button>
      </div>
    </header>
  );
}
