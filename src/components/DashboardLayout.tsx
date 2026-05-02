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
    FolderTree,
    Award,
    ListChecks,
    PenTool
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
const logo = "/logo.png";

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
        { icon: <Award size={20} />, label: 'Test Results', path: '/dashboard/results' },
        { icon: <FileText size={20} />, label: 'Buy Series', path: '/dashboard/market' },
        { icon: <PenTool size={20} />, label: 'PYQs', path: '/dashboard/pyqs' },
        // { icon: <BookOpen size={20} />, label: 'Resources', path: '/dashboard/resources' },
        { icon: <TrendingUp size={20} />, label: 'Analytics', path: '/dashboard/analytics' },
    ];

    const adminLinks = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin-dashboard' },
        { icon: <ListChecks size={20} />, label: 'Test Series', path: '/admin-dashboard/test-series' },
        { icon: <BookMarked size={20} />, label: 'Question Bank', path: '/admin-dashboard/question-bank' },
        { icon: <FolderTree size={20} />, label: 'Chapters', path: '/admin-dashboard/chapters' },
        { icon: <BookOpen size={20} />, label: 'Manage Tests', path: '/admin-dashboard/tests' },
        { icon: <FileText size={20} />, label: 'Manage PYQs', path: '/admin-dashboard/pyqs' },
        { icon: <Award size={20} />, label: 'Subjects', path: '/admin-dashboard/subjects' },
        { icon: <FolderTree size={20} />, label: 'Classes', path: '/admin-dashboard/classes' },
        { icon: <BookOpen size={20} />, label: 'Resources', path: '/admin-dashboard/resources' },
        { icon: <Users size={20} />, label: 'Students', path: '/admin-dashboard/students' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/admin-dashboard/settings' },
    ];

    const links = role === 'admin' ? adminLinks : studentLinks;

    // Determine theme based on role or globally (For now enforcing Dark for Admin as requested, but Layout wraps both. 
    // We'll apply Dark Theme generally as the user implies a system-wide design change or at least for the Admin view).
    // The screenshot implies a global dark theme app.
    const isDarkTheme = false; // Could be a prop or context later.

    return (
        <div className={`min-h-screen flex ${isDarkTheme ? 'bg-[#0B0F19] text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:sticky top-0 h-screen w-72 
                    ${isDarkTheme ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}
                    border-r z-50 transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    flex flex-col shadow-2xl md:shadow-none print:hidden
                `}
            >
                {/* Logo Area */}
                <div className="px-6 py-8 flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-teal-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                        <img src={logo} alt="Logo" className={`relative w-10 h-10 rounded-full shadow-lg p-0.5 ${isDarkTheme ? 'bg-[#0B0F19]' : 'bg-white'}`} />
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isDarkTheme ? 'from-white to-slate-400' : 'from-slate-800 to-slate-600'} tracking-tight`}>
                            DHItantra
                        </h2>
                        <p className={`text-[10px] uppercase tracking-widest font-bold ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                            {role === 'admin' ? 'Admin Portal' : 'Student Portal'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className={`ml-auto md:hidden p-2 rounded-lg transition-colors ${isDarkTheme ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Separator */}
                <div className={`h-px bg-gradient-to-r from-transparent ${isDarkTheme ? 'via-slate-800' : 'via-slate-200'} to-transparent mx-6 mb-4`}></div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) => `
                                relative group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium overflow-hidden
                                ${isActive
                                    ? 'bg-gradient-to-r from-teal-600 to-teal-600 text-white shadow-lg shadow-teal-500/20 translate-x-1'
                                    : `${isDarkTheme ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'} hover:translate-x-1`
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active State Glow */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-transparent mix-blend-overlay"></div>
                                    )}

                                    <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {link.icon}
                                    </span>
                                    <span className="relative z-10">{link.label}</span>

                                    {/* Active Indicator Dot */}
                                    {isActive && (
                                        <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-pulse"></div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 mt-auto">
                    <div className={`p-4 rounded-2xl border backdrop-blur-sm ${isDarkTheme ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold group shadow-sm ${isDarkTheme ? 'text-red-400 hover:text-white hover:bg-red-500/20' : 'text-red-600 hover:text-white hover:bg-red-500'} hover:shadow-lg`}
                        >
                            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className={`sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b ${isDarkTheme ? 'bg-[#0B0F19]/80 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200'} print:hidden`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`md:hidden p-1 rounded-lg ${isDarkTheme ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-700 bg-slate-100'}`}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className={`text-xl font-bold hidden sm:block ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                                {role === 'admin' ? 'Admin Portal' : 'Student Dashboard'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className={`relative p-2 rounded-full transition-colors ${isDarkTheme ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-inherit"></span>
                        </button>
                        <div className={`flex items-center gap-3 pl-4 border-l ${isDarkTheme ? 'border-slate-800' : 'border-slate-200'}`}>
                            <div className="text-right hidden sm:block">
                                <p className={`text-sm font-semibold leading-none ${isDarkTheme ? 'text-white' : 'text-slate-700'}`}>{currentUser?.displayName || 'User'}</p>
                                <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-500' : 'text-slate-500'}`}>{role === 'admin' ? 'Administrator' : 'Student'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20 ring-2 ring-white/10">
                                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden pt-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
