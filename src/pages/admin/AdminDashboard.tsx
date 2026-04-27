import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    FileText,
    Plus,
    BookOpen,
    HelpCircle,
    Copy,
    TrendingUp,
    ExternalLink,
    Loader2,
    Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, type DashboardStats } from '../../services/dashboardService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<number[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [stats, analytics] = await Promise.all([
                    dashboardService.getDashboardStats(),
                    dashboardService.getAnalyticsData()
                ]);
                setDashboardStats(stats);
                setChartData(analytics);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const stats = [
        {
            label: 'Total Students',
            value: dashboardStats?.totalStudents.toLocaleString() || '0',
            trend: 'Registered',
            trendUp: true,
            icon: Users,
            color: 'bg-orange-50',
            glow: 'shadow-sm'
        },
        {
            label: 'Active Test Series',
            value: dashboardStats?.activeTestSeries.toLocaleString() || '0',
            trend: 'Live & Published',
            trendUp: true,
            icon: Copy,
            color: 'bg-orange-50',
            glow: 'shadow-sm'
        },
        {
            label: 'Question Bank',
            value: dashboardStats?.totalQuestions.toLocaleString() || '0',
            trend: 'Total Questions',
            trendUp: true,
            icon: HelpCircle,
            color: 'bg-orange-50',
            glow: 'shadow-sm'
        },
        {
            label: 'Total Chapters',
            value: dashboardStats?.totalChapters.toLocaleString() || '0',
            trend: 'Across all subjects',
            trendUp: true,
            icon: BookOpen,
            color: 'bg-orange-50',
            glow: 'shadow-sm'
        }
    ];

    const quickActions = [
        { label: 'Create Test Series', icon: Plus, path: '/admin-dashboard/test-series', color: 'bg-slate-800 text-white hover:bg-slate-700' },
        { label: 'Create New Test', icon: FileText, path: '/admin-dashboard/create-test', color: 'bg-slate-800 text-white hover:bg-slate-700' },
        { label: 'Add Question', icon: HelpCircle, path: '/admin-dashboard/question-bank', color: 'bg-slate-800 text-white hover:bg-slate-700' },
        { label: 'Manage Subjects', icon: Award, path: '/admin-dashboard/subjects', color: 'bg-slate-800 text-white hover:bg-slate-700' },
        { label: 'Create Chapter', icon: BookOpen, path: '/admin-dashboard/chapters', color: 'bg-slate-800 text-white hover:bg-slate-700' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <Loader2 className="animate-spin text-orange-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-6 lg:p-10 -m-4 md:-m-6 lg:-m-8">
            <motion.div
                className="max-w-7xl mx-auto space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Welcome Back, <span className="text-orange-600">Admin</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Here's what's happening with your platform today.</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden group hover:border-orange-200 transition-all hover:shadow-lg"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-xl ${stat.color} ${stat.glow} text-orange-600`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors cursor-pointer">
                                    <ExternalLink size={16} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                                <p className="text-slate-500 text-sm mb-4">{stat.label}</p>
                                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                                    <TrendingUp size={14} />
                                    <span>{stat.trend}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Analytics Chart */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-lg font-bold text-slate-900">Platform Analytics</h2>
                            <select className="bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 px-3 py-1.5 focus:ring-0 cursor-pointer hover:border-slate-300 transition-colors">
                                <option>This Week</option>
                                <option>Last Week</option>
                                <option>This Month</option>
                            </select>
                        </div>

                        <div className="h-64 w-full flex items-end justify-between px-2 gap-4">
                            {chartData.map((height, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                                        className="w-full bg-slate-100 rounded-md relative overflow-hidden group-hover:bg-slate-200 transition-all"
                                    >
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-orange-500/30 to-transparent h-full opacity-50"></div>
                                    </motion.div>
                                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                        {height} Users
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-slate-400 px-1 uppercase font-medium">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
                            <div className="space-y-4">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(action.path)}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl text-left group hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                                                <action.icon size={20} />
                                            </div>
                                            <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{action.label}</span>
                                        </div>
                                        <ExternalLink size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
export default AdminDashboard;
