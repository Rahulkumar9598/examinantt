import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Award, Target, BookOpen, BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Attempt {
    id: string;
    testTitle: string;
    score: number;
    totalQuestions: number;
    attemptDate: any;
    duration?: number; // in seconds
    attemptedQuestions?: number;
}

const StudentAnalyticsPage = () => {
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [stats, setStats] = useState({
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        timeEfficiency: '--'
    });

    useEffect(() => {
        if (currentUser) {
            const q = query(collection(db, 'users', currentUser.uid, 'attempts'), orderBy('attemptDate', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedAttempts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Attempt[];

                setAttempts(fetchedAttempts);

                // Calculate Stats
                if (fetchedAttempts.length > 0) {
                    const total = fetchedAttempts.length;
                    const totalScorePercentage = fetchedAttempts.reduce((acc, curr) => {
                        const maxScore = curr.totalQuestions * 4;
                        return acc + (maxScore > 0 ? (curr.score / maxScore) * 100 : 0);
                    }, 0);

                    const avg = totalScorePercentage / total;
                    const best = Math.max(...fetchedAttempts.map(a => {
                        const maxScore = a.totalQuestions * 4;
                        return maxScore > 0 ? (a.score / maxScore) * 100 : 0;
                    }));

                    // Calculate Time Efficiency (Avg time per attempted question)
                    let totalTime = 0;
                    let totalAttempted = 0;
                    fetchedAttempts.forEach(a => {
                        if (a.duration && a.attemptedQuestions) {
                            totalTime += a.duration;
                            totalAttempted += a.attemptedQuestions;
                        }
                    });

                    let timeEffStr = '--';
                    if (totalAttempted > 0) {
                        const avgSecondsPerQ = totalTime / totalAttempted;
                        if (avgSecondsPerQ < 60) {
                            timeEffStr = `${Math.round(avgSecondsPerQ)}s / q`;
                        } else {
                            const m = Math.floor(avgSecondsPerQ / 60);
                            const s = Math.round(avgSecondsPerQ % 60);
                            timeEffStr = `${m}m ${s}s / q`;
                        }
                    }

                    setStats({
                        totalTests: total,
                        averageScore: Math.round(avg),
                        bestScore: Math.round(best),
                        timeEfficiency: timeEffStr
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    // Prepare Chart Data (Chronological Order)
    const chartData = [...attempts].reverse().map(attempt => ({
        name: attempt.testTitle.substring(0, 15) + (attempt.testTitle.length > 15 ? '...' : ''),
        score: Math.round((attempt.score / (attempt.totalQuestions * 4)) * 100),
        date: attempt.attemptDate?.toDate ? attempt.attemptDate.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
    }));

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

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Performance Analytics</h1>
                <p className="text-slate-500 mt-1">Track your progress and identify areas for improvement.</p>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Tests Taken</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.totalTests}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Average Score</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.averageScore}%</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Best Score</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.bestScore}%</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Time Efficiency</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.timeEfficiency}</h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Recent Test Activity</h3>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Test Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attempts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            No tests attempted yet.
                                        </td>
                                    </tr>
                                ) : (
                                    attempts.slice(0, 5).map((attempt) => (
                                        <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-700">{attempt.testTitle}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {attempt.attemptDate?.toDate ? attempt.attemptDate.toDate().toLocaleDateString() : 'Just now'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {attempt.score}/{attempt.totalQuestions * 4}
                                                <span className="text-xs text-slate-400 ml-2 font-normal">
                                                    ({Math.round((attempt.score / (attempt.totalQuestions * 4)) * 100)}%)
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                                                    Completed
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Score Chart */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-purple-600" />
                        Score Trend
                    </h3>
                    <div className="h-64 w-full">
                        {attempts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748B' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                Not enough data
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default StudentAnalyticsPage;
