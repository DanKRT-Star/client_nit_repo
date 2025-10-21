import { Link } from "react-router"

export default function Sidebar({currentPage} : {
    currentPage: string,
}) {
    const NavItems = [
        { name: "Dashboard", icon: <HomeIcon /> },
        { name: "Lessons", icon: <LessonIcon /> },
        { name: "Courses", icon: <BookIcon /> },
        { name: "Assignment", icon: <TasksIcon /> },
        { name: "Calendar", icon: <CalendarIcon /> },
        { name: "Blog", icon: <BlogIcon /> },
        { name: "Settings", icon: <CogIcon /> }
    ]

    return (
        <div className="w-fit h-full bg-primary">

            <nav className="mt-5">
                <ul>
                    {NavItems.map(({ name, icon }) => {
                        const path = name === "Dashboard" ? "/" : `/${name.toLowerCase()}`;
                        const isActive = currentPage === path;

                        return (
                        <li
                            key={name}
                            className={`cursor-pointer flex items-center gap-3 py-4 pl-10 pr-5
                            ${isActive ? "bg-background text-primary" : "text-white"}`}
                        >
                            <Link to={path} className="flex items-center gap-3 w-full">
                            <span className="text-lg">{icon}</span>
                            <span>{name}</span>
                            </Link>
                        </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    )
}   

function HomeIcon() {
    return (
        <svg  xmlns="http://www.w3.org/2000/svg" width="25" height="25"  fill="currentColor" viewBox="0 0 24 24" >
            <path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.4 0 .77-.24.92-.62.16-.37.07-.8-.22-1.09l-8.99-9a.996.996 0 0 0-1.41 0l-9.01 9c-.29.29-.37.72-.22 1.09s.52.62.92.62Zm6 2c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v5H9z"></path>
        </svg>
    )
}

function LessonIcon() {
    return (
        <svg  xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 24 24" >
            <path d="M14.71 2.29A1 1 0 0 0 14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-.27-.11-.52-.29-.71zM7 7h4v2H7zm10 10H7v-2h10zm0-4H7v-2h10zm-4-4V3.5L18.5 9z"></path>
        </svg>
    )
}

function BookIcon() {
    return (
        <svg  xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 24 24" >
            <path d="M20 2H6C4.35 2 3 3.35 3 5v14c0 1.65 1.35 3 3 3h15v-2H6c-.55 0-1-.45-1-1s.45-1 1-1h14c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1m-3 9-2-1-2 1V4h4z"></path>
        </svg>
    )
}

function TasksIcon() {
    return (
        <svg  xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 24 24" >
            <path d="M9 11h11v2H9zM9 6h11v2H9zM9 16h11v2H9zM4 5.5h3v3H4zM4 10.5h3v3H4zM4 15.5h3v3H4z"></path>
        </svg>
    )
}

function CalendarIcon() {
    return (
        <svg  xmlns="http://www.w3.org/2000/svg" width="25" height="25"  fill="currentColor" viewBox="0 0 24 24" >
            <path d="m19,4h-2v-2h-2v2h-6v-2h-2v2h-2c-1.1,0-2,.9-2,2v1h18v-1c0-1.1-.9-2-2-2Z"></path><path d="m3,20c0,1.1.9,2,2,2h14c1.1,0,2-.9,2-2v-12H3v12Zm12-8h2v2h-2v-2Zm0,4h2v2h-2v-2Zm-4-4h2v2h-2v-2Zm0,4h2v2h-2v-2Zm-4-4h2v2h-2v-2Zm0,4h2v2h-2v-2Z"></path>
        </svg>
    )
}

function BlogIcon() {
    return (
        <svg  xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 24 24" >
            <path d="M9.01 13.58v-.08c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5h-.08l-5.92 5.92.2.2 12.3-3.35v-5.35l1.5-1.5-5.41-5.41-1.5 1.5H6.25L2.9 19.31l.2.2 5.92-5.92ZM19.92 9.5l1.09-1.09c.38-.38.58-.88.58-1.42 0-.53-.21-1.04-.59-1.41L18.41 3c-.78-.78-2.05-.78-2.83 0L14.5 4.08z"></path>
        </svg>
    )
}

function CogIcon() {
    return (
        <svg  xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 24 24" >
            <path d="m21.16 7.86-1-1.73a1.997 1.997 0 0 0-2.73-.73l-.53.31c-.58-.46-1.22-.83-1.9-1.11V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v.6c-.67.28-1.31.66-1.9 1.11l-.53-.31c-.96-.55-2.18-.22-2.73.73l-1 1.73c-.55.96-.22 2.18.73 2.73l.5.29c-.05.37-.08.74-.08 1.11s.03.74.08 1.11l-.5.29c-.96.55-1.28 1.78-.73 2.73l1 1.73c.55.95 1.78 1.28 2.73.73l.53-.31c.58.46 1.22.83 1.9 1.11v.6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-.6a8.7 8.7 0 0 0 1.9-1.11l.53.31c.96.55 2.18.22 2.73-.73l1-1.73c.55-.96.22-2.18-.73-2.73l-.5-.29c.05-.37.08-.74.08-1.11s-.03-.74-.08-1.11l.5-.29c.96-.55 1.28-1.78.73-2.73M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4"></path>
        </svg>
    )
}
