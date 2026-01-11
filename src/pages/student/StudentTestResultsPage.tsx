import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Award, BarChart3, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface TestAttempt {
    id: string;
    testTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    attemptDate: any;
    duration?: number;
}

const StudentTestResultsPage = () => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;

    const [attempts, setAttempts] = useState<TestAttempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0
    });

    useEffect(() => {
        const fetchAttempts = async () => {
            if (!currentUser) return;

            try {
                const attemptsRef = collection(db, 'users', currentUser.uid, 'attempts');
                const q = query(attemptsRef, orderBy('attemptDate', 'desc'), limit(50));
                const snapshot = await getDocs(q);

                const fetchedAttempts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TestAttempt[];

                setAttempts(fetchedAttempts);

                // Calculate statistics
                if (fetchedAttempts.length > 0) {
                    const totalScore = fetchedAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
                    const bestScore = Math.max(...fetchedAttempts.map(a => a.score));
                    const totalTime = fetchedAttempts.reduce((sum, attempt) => sum + (attempt.duration || 0), 0);

                    setStats({
                        totalAttempts: fetchedAttempts.length,
                        averageScore: Math.round(totalScore / fetchedAttempts.length),
                        bestScore: bestScore,
                        totalTimeSpent: totalTime
                    });
                }
            } catch (error) {
                console.error('Error fetching attempts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttempts();
    }, [currentUser]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number, total: number) => {
        const percentage = (score / total) * 100;
        if (percentage >= 80) return 'text-green-600 bg-green-50';
        if (percentage >= 60) return 'text-blue-600 bg-blue-50';
        if (percentage >= 40) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Test Results & History</h1>
                <p className="text-slate-500 mt-2">Track your performance and progress over time</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Tests</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.totalAttempts}</h3>
                        </div>
                        <BookOpen size={40} className="opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Average Score</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.averageScore}</h3>
                        </div>
                        <TrendingUp size={40} className="opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Best Score</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.bestScore}</h3>
                        </div>
                        <Award size={40} className="opacity-80" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Time Spent</p>
                            <h3 className="text-2xl font-bold mt-2">{formatDuration(stats.totalTimeSpent)}</h3>
                        </div>
                        <Clock size={40} className="opacity-80" />
                    </div>
                </motion.div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Test History</h2>
                </div>

                {attempts.length === 0 ? (
                    <div className="p-12 text-center">
                        <BarChart3 className="mx-auto text-slate-300 mb-4" size={64} />
                        <h3 className="text-lg font-bold text-slate-600 mb-2">No tests attempted yet</h3>
                        <p className="text-slate-500 mb-6">Start your first test to see results here</p>
                        <button
                            onClick={() => navigate('/dashboard/market')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        >
                            <Target size={20} />
                            Browse Tests
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">Test Name</th>
                                    <th className="px-6 py-4 text-left">Date & Time</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4 text-center">Correct</th>
                                    <th className="px-6 py-4 text-center">Accuracy</th>
                                    <th className="px-6 py-4 text-center">Duration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attempts.map((attempt) => {
                                    const maxScore = attempt.totalQuestions * 4;
                                    const accuracy = ((attempt.correctAnswers / attempt.totalQuestions) * 100).toFixed(1);

                                    return (
                                        <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-800">{attempt.testTitle}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {formatDate(attempt.attemptDate)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${getScoreColor(attempt.score, maxScore)}`}>
                                                        {attempt.score} / {maxScore}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-semibold text-green-600">
                                                    {attempt.correctAnswers}/{attempt.totalQuestions}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-semibold text-blue-600">{accuracy}%</span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-slate-600">
                                                {attempt.duration ? formatDuration(attempt.duration) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                                                    onClick={() => navigate(`/dashboard/results/${attempt.id}`)}
                                                >
                                                    View Details
                                                    <ArrowRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {attempts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/dashboard/analytics')}
                        className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl hover:shadow-lg transition-shadow group"
                    >
                        <BarChart3 className="text-indigo-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="font-bold text-slate-800 mb-1">View Analytics</h3>
                        <p className="text-sm text-slate-600">Detailed performance insights</p>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/tests')}
                        className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl hover:shadow-lg transition-shadow group"
                    >
                        <Zap className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="font-bold text-slate-800 mb-1">Practice More</h3>
                        <p className="text-sm text-slate-600">Continue improving your skills</p>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl hover:shadow-lg transition-shadow group"
                    >
                        <Target className="text-green-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="font-bold text-slate-800 mb-1">Dashboard</h3>
                        <p className="text-sm text-slate-600">View your study progress</p>
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentTestResultsPage;
