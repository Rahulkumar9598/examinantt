import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Loader2, AlertTriangle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { deleteTest } from '../../services/testService';
import type { Test } from '../../types/test.types';

const AdminTestsPage = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Deletion Modal State
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isDeletingLoading, setIsDeletingLoading] = useState(false);

    useEffect(() => {
        // Fetching from 'tests' collection (individual tests)
        const q = query(collection(db, 'tests'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Test[];
            setTests(fetchedTests);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching tests:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        setIsDeletingLoading(true);
        try {
            await deleteTest(id);
            setConfirmDeleteId(null);
        } catch (error) {
            console.error("Error deleting test:", error);
            alert("Failed to delete test. It might be in use.");
        } finally {
            setIsDeletingLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const filteredTests = tests.filter(test =>
        test.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Individual Tests</h1>
                    <p className="text-slate-500 mt-1">Manage all interactive tests across your test series.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin-dashboard/create-test')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
                    >
                        <Plus size={20} />
                        Create New Test
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Header/Filter Area */}
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tests by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Test Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Questions</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} /> Loading tests...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No tests found. Create one using the Test Wizard.
                                    </td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700">{test.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-tighter">
                                                ID: {test.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize text-slate-500 text-sm">{test.testType}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {test.questionIds?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {test.settings?.duration || 180} min
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${test.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {test.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/dashboard/attempt/${test.id}`)}
                                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Preview Test"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(test.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Test"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDeleteId && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Confirm Deletion</h3>
                            <p className="text-slate-500 mt-2 mb-8">
                                Are you sure you want to delete this test? This will remove it from all linked test series and delete all student attempts.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    disabled={isDeletingLoading}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDeleteId)}
                                    disabled={isDeletingLoading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                >
                                    {isDeletingLoading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                    {isDeletingLoading ? 'Deleting...' : 'Delete Test'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminTestsPage;
