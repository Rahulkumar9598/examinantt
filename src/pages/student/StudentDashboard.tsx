import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Award, BarChart2, TrendingUp, ChevronRight, BookOpen, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot as fsOnSnapshot } from 'firebase/firestore';
import {
    getStudentStats,
    getRecommendedSeries,
    formatDurationHours,
    type StudentStats,
    type RecommendedSeries,
    type ActiveTest
} from '../../services/studentDashboardService';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const currentUser = auth?.currentUser;

    const [stats, setStats] = useState<StudentStats>({
        totalTests: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        testsTrend: 'Start now',
        scoreTrend: '-',
        timeTrend: '-'
    });
    const [recommendations, setRecommendations] = useState<RecommendedSeries[]>([]);
    const [activeTests, setActiveTests] = useState<ActiveTest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // 1. Fetch static data
        const loadStats = async () => {
            try {
                const [statsData, recData] = await Promise.all([
                    getStudentStats(currentUser.uid),
                    getRecommendedSeries()
                ]);
                setStats(statsData);
                setRecommendations(recData);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();

        // 2. Setup live listener for purchases/active tests
        const purchasesRef = collection(db, 'users', currentUser.uid, 'purchases');
        const q = query(purchasesRef, orderBy('purchaseDate', 'desc'), limit(10));
        
        const unsubscribe = fsOnSnapshot(q, (snapshot) => {
            const activeData = snapshot.docs.map(doc => {
                const data = doc.data();
                const title = data.seriesTitle || data.testTitle || data.title || 'Untitled';
                const category = data.category || 'Test Series';
                
                // Intelligent type detection for older data
                let type = data.type;
                if (!type) {
                    if (category.toLowerCase().includes('pyq') || title.toLowerCase().includes('pyq')) {
                        type = 'pyq';
                    } else {
                        type = 'testSeries';
                    }
                }

                return {
                    id: doc.id,
                    testId: data.seriesId || data.testId,
                    title: title,
                    category: category,
                    purchaseDate: data.purchaseDate,
                    type: type
                } as ActiveTest;
            });
            console.log("Dashboard Active Data Loaded:", activeData);
            setActiveTests(activeData);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Tests Completed',
                        value: stats.totalTests.toString(),
                        icon: Award,
                        color: 'text-orange-500',
                        bg: 'bg-orange-50',
                        trend: stats.testsTrend,
                        trendColor: 'text-green-600'
                    },
                    {
                        label: 'Average Score',
                        value: `${stats.averageScore}%`,
                        icon: BarChart2,
                        color: 'text-blue-500',
                        bg: 'bg-blue-50',
                        trend: stats.scoreTrend,
                        trendColor: 'text-green-600'
                    },
                    {
                        label: 'Hours Spent',
                        value: formatDurationHours(stats.totalTimeSpent),
                        icon: Clock,
                        color: 'text-purple-500',
                        bg: 'bg-purple-50',
                        trend: stats.timeTrend,
                        trendColor: 'text-slate-500'
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-slate-500 font-medium text-sm">{stat.label}</span>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                            <span className={`text-xs font-medium mb-1.5 ${stat.trendColor} flex items-center gap-1`}>
                                {stat.trend.includes('+') && <TrendingUp size={12} />}
                                {stat.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>



            {/* My Purchased PYQs Section */}
            <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">My PYQs</h2>
                    <button
                        onClick={() => navigate('/dashboard/pyqs')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors"
                    >
                        View All PYQs <ChevronRight size={16} />
                    </button>
                </div>

                {activeTests.filter(t => t.category?.toLowerCase().includes('pyq') || (t as any).type === 'pyq' || t.title?.toLowerCase().includes('pyq')).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeTests.filter(t => t.category?.toLowerCase().includes('pyq') || (t as any).type === 'pyq' || t.title?.toLowerCase().includes('pyq')).map((pyq) => (
                            <div
                                key={pyq.id}
                                onClick={() => navigate('/dashboard/pyqs')}
                                className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{pyq.title}</h4>
                                        <p className="text-xs text-slate-500">Unlocked: {pyq.purchaseDate?.toDate().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center">
                        <FileText size={32} className="text-slate-400 mb-3" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">No PYQs Unlocked</h3>
                        <p className="text-xs text-slate-500 mb-4">Start practicing with previous year questions.</p>
                        <button
                            onClick={() => navigate('/dashboard/pyqs')}
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all"
                        >
                            Browse PYQs
                        </button>
                    </div>
                )}
            </motion.section>

            {/* Recommended Tests Section */}
            <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Recommended Test Series</h2>
                    <button
                        onClick={() => navigate('/dashboard/market')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors"
                    >
                        View Market <ChevronRight size={16} />
                    </button>
                </div>

                {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((series) => (
                            <motion.div
                                key={series.id}
                                whileHover={{ y: -4 }}
                                onClick={() => navigate('/dashboard/market')} 
                                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer"
                            >
                                <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 relative p-6 flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <BookOpen size={80} className="text-white" />
                                    </div>
                                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-white w-fit border border-white/20">
                                        {series.category || 'General'}
                                    </span>
                                </div>
                                <div className="p-5 space-y-4">
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {series.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} className="text-slate-400" />
                                            <span>Variable</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <PlayCircle size={16} className="text-slate-400" />
                                            <span>{series.stats?.totalTests || 'Multiple'} Tests</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-2xl font-bold text-slate-800">
                                            {series.price === 0 ? 'Free' : `₹${series.price}`}
                                        </span>
                                        <span className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200">
                                            View Details
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No recommended series found at the moment.</p>
                        <button
                            onClick={() => navigate('/dashboard/market')}
                            className="text-blue-600 font-bold mt-2 hover:underline"
                        >
                            Browse all series
                        </button>
                    </div>
                )}
            </motion.section>
        </motion.div>
    );
};

export default StudentDashboard;
