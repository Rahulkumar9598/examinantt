import { motion } from 'framer-motion';
import { Search, MoreVertical } from 'lucide-react';

const AdminStudentsPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Students</h1>
                    <p className="text-slate-500 mt-1">View and manage registered students.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                        Export CSV
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                        Invite Student
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:border-blue-500">
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Tests Taken</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                ST
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800">Student Name {i}</div>
                                                <div className="text-xs text-slate-500">student{i}@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">1{i}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">Dec 12, 2024</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1 text-slate-400 hover:text-slate-600">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                    <span>Showing 1-6 of 240 students</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminStudentsPage;
