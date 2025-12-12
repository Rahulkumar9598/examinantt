import { motion } from 'framer-motion';
import { PlayCircle, Clock, Award, BarChart2, TrendingUp, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();

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
                    { label: 'Tests Completed', value: '12', icon: Award, color: 'text-orange-500', bg: 'bg-orange-50', trend: '+2 this week', trendColor: 'text-green-600' },
                    { label: 'Average Score', value: '78%', icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+5% improvement', trendColor: 'text-green-600' },
                    { label: 'Hours Spent', value: '24h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50', trend: 'Last 30 days', trendColor: 'text-slate-500' }
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -4 }}
                            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                        >
                            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 relative p-6 flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <BookOpen size={80} className="text-white" />
                                </div>
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-white w-fit border border-white/20">
                                    JEE Mains
                                </span>
                            </div>
                            <div className="p-5 space-y-4">
                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                    Full Mock Test Series {i}
                                </h3>
                                <div className="flex items-center gap-4 text-slate-500 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="text-slate-400" />
                                        <span>3 Hours</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <PlayCircle size={16} className="text-slate-400" />
                                        <span>15 Tests</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-2xl font-bold text-slate-800">₹499</span>
                                    <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200">
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Active Tests Section */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Your Active Tests</h2>
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <PlayCircle size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">No Active Tests</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-6">
                        You haven't started any tests yet. Browse our marketplace to find the perfect test series for you.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/market')}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                        Browse Tests
                    </button>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default StudentDashboard;
