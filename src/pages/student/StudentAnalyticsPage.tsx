import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Award, Target, BookOpen, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Attempt {
    id: string;
    testTitle: string;
    score: number;
    totalQuestions: number;
    attemptDate: any;
}

const StudentAnalyticsPage = () => {
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [stats, setStats] = useState({
        totalTests: 0,
        averageScore: 0,
        bestScore: 0
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
                    const totalScore = fetchedAttempts.reduce((acc, curr) => acc + (curr.score / (curr.totalQuestions * 4)) * 100, 0); // Assuming 4 marks per q
                    const avg = totalScore / total;
                    const best = Math.max(...fetchedAttempts.map(a => (a.score / (a.totalQuestions * 4)) * 100));

                    setStats({
                        totalTests: total,
                        averageScore: Math.round(avg),
                        bestScore: Math.round(best)
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

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
                            <h3 className="text-2xl font-bold text-slate-800">--</h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Recent Test Activity</h3>
                    </div>
                    <div className="overflow-x-auto">
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
                                    attempts.map((attempt) => (
                                        <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-700">{attempt.testTitle}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {attempt.attemptDate?.toDate ? attempt.attemptDate.toDate().toLocaleDateString() : 'Just now'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">{attempt.score}/{attempt.totalQuestions * 4}</td>
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

                {/* Score Chart Placeholder */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-purple-600" />
                        Performance
                    </h3>
                    <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Chart coming soon
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default StudentAnalyticsPage;
