import { motion } from 'framer-motion';
import { Upload, Users, FileText, CheckCircle, Plus, Search, MoreHorizontal } from 'lucide-react';

const AdminDashboard = () => {
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
            {/* Quick Actions */}
            <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your platform, users, and content efficiently.</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                        <Plus size={16} /> New Test Series
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                        <Upload size={16} /> Bulk Upload
                    </button>
                </div>
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Students', value: '1,248', trend: '+12% this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trendColor: 'text-green-600' },
                    { label: 'Active Test Series', value: '45', trend: 'Objective & Subjective', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', trendColor: 'text-slate-500' },
                    { label: 'Pending Evaluations', value: '18', trend: 'Needs attention', icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-50', trendColor: 'text-orange-600' }
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
                            <span className={`text-xs font-medium mb-1.5 ${stat.trendColor}`}>
                                {stat.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Uploads / Management Section */}
            <motion.section variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Recent Test Series</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-48 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { title: 'Advanced Physics 2024', type: 'Objective', price: '₹999', status: 'Active' },
                                    { title: 'English Literature Final', type: 'Subjective', price: '₹499', status: 'Draft' },
                                    { title: 'Maths Olympiad Prep', type: 'Objective', price: '₹1499', status: 'Active' },
                                    { title: 'Chemistry NEET Special', type: 'Objective', price: '₹799', status: 'Active' },
                                ].map((test, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">{test.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${test.type === 'Objective' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-pink-50 text-pink-700 border-pink-100'}`}>
                                                {test.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{test.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-sm ${test.status === 'Active' ? 'text-green-600' : 'text-slate-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${test.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                                {test.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm text-slate-500">
                        <span>Showing 4 of 45 results</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-slate-200 rounded-md bg-white disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50">Next</button>
                        </div>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default AdminDashboard;
