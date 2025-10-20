import { Link } from "react-router-dom"

interface SidebarProps {
    currentPage: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ currentPage, isOpen, onClose }: SidebarProps) {
    const NavItems = [
        { name: "Courses", icon: <BookIcon /> },
        { name: "Assessments", icon: <AssessmentIcon /> },
        { name: "Challenges", icon: <ChallengeIcon /> },
        { name: "Certification", icon: <CertificateIcon /> },
        { name: "Project", icon: <ProjectIcon /> },
        { name: "Download", icon: <DownloadIcon /> }
    ]

    return (
        <>
            {/* Overlay*/}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
                    role = "button"
                    tabIndex = {0}
                    aria-label = "Close sidebar"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed xl:relative
                top-0 left-0 h-full
                w-64 bg-surface
                flex flex-col
                pl-6
                z-40
                ${isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
            `}>
                {/* Close button*/}
                <div className="xl:hidden flex justify-end p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-primary" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 pt-6 xl:pt-6">
                    <ul className="space-y-1 px-3">
                        {NavItems.map(({ name, icon }) => {
                            const path = name === "Dashboard" ? "/" : `/${name.toLowerCase()}`;
                            const isActive = currentPage === path;

                            return (
                            <li key={name}>
                                <Link 
                                    to={path} 
                                    onClick={onClose}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                                        isActive 
                                            ? "bg-primary text-primary font-medium shadow-sm" 
                                            : "hover:bg-component"
                                    }`}
                                >
                                    <span className="text-lg">{icon}</span>
                                    <span className="text-sm">{name}</span>
                                </Link>
                            </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Unlock Premium Section */}
                <div className="p-6">
                    <div className="bg-primary rounded-lg p-4 text-center shadow-sm">
                        <div className="w-16 h-16 bg-background text-main rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V12c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z"/>
                            </svg>
                        </div>
                        <p className="text-xs text-primary mb-3">
                            Unlock Premium<br/>Resources & Features
                        </p>
                        <button type="button" className="w-full bg-background hover:bg-gray-800 dark:hover:bg-gray-100 font-medium py-2 px-4 rounded-lg text-sm">
                            Upgrade
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}   


function BookIcon() {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H6C4.35 2 3 3.35 3 5v14c0 1.65 1.35 3 3 3h15v-2H6c-.55 0-1-.45-1-1s.45-1 1-1h14c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1m-3 9-2-1-2 1V4h4z"/>
        </svg>
    )
}

function AssessmentIcon() {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
    )
}

function ChallengeIcon() {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/>
        </svg>
    )
}

function CertificateIcon() {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9l-2 3v1l4-4 4 4v-1l-2-3h3c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 11.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
        </svg>
    )
}

function ProjectIcon() {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 6h-3v3h-2v-3h-3v-2h3V7h2v3h3v2z"/>
        </svg>
    )
}

function DownloadIcon() {
    return (
        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V12c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z"/>
            <path d="M12 15l-4 4h3v3h2v-3h3l-4-4z"/>
        </svg>
    )
}