import { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    TrendingUp,
    Settings,
    LogOut,
    FileText,
    Users,
    Menu,
    X,
    Bell,
    BookMarked,
    FolderTree
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import logo from '../assets/logo.png';

interface DashboardLayoutProps {
    children: ReactNode;
    role: 'student' | 'admin';
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const studentLinks = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
        { icon: <BookOpen size={20} />, label: 'My Tests', path: '/dashboard/tests' },
        { icon: <FileText size={20} />, label: 'Buy Series', path: '/dashboard/market' },
        { icon: <FileText size={20} />, label: 'PYQs', path: '/dashboard/pyqs' },
        { icon: <BookOpen size={20} />, label: 'Resources', path: '/dashboard/resources' },
        { icon: <TrendingUp size={20} />, label: 'Analytics', path: '/dashboard/analytics' },
    ];

    const adminLinks = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin-dashboard' },
        { icon: <BookMarked size={20} />, label: 'Question Bank', path: '/admin-dashboard/question-bank' },
        { icon: <FolderTree size={20} />, label: 'Chapters', path: '/admin-dashboard/chapters' },
        { icon: <BookOpen size={20} />, label: 'Manage Tests', path: '/admin-dashboard/tests' },
        { icon: <FileText size={20} />, label: 'Manage PYQs', path: '/admin-dashboard/pyqs' },
        { icon: <BookOpen size={20} />, label: 'Resources', path: '/admin-dashboard/resources' },
        { icon: <Users size={20} />, label: 'Students', path: '/admin-dashboard/students' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/admin-dashboard/settings' },
    ];

    const links = role === 'admin' ? adminLinks : studentLinks;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:sticky top-0 h-screen w-72 bg-white border-r border-slate-200 z-50 transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    flex flex-col shadow-xl md:shadow-none
                `}
            >
                {/* Logo Area */}
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-9 h-9 rounded-lg shadow-sm" />
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
                        Examinantt
                    </h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="ml-auto md:hidden text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsSidebarOpen(false)} // Close on mobile click
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                                ${isActive
                                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }
                            `}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden text-slate-500 hover:text-slate-700 p-1 bg-slate-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
                                {role === 'admin' ? 'Admin Portal' : 'Student Dashboard'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-700 leading-none">{currentUser?.displayName || 'User'}</p>
                                <p className="text-xs text-slate-500 mt-1">{role === 'admin' ? 'Administrator' : 'Student'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200 ring-2 ring-white">
                                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden pt-4"> {/* Added padding top */}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
