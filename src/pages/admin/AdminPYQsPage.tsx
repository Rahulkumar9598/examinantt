import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Loader2, FileText, PenTool } from 'lucide-react';
import { db } from '../../firebase';
import { collection, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface PYQ {
    id: string;
    title: string;
    category: string;
    year: string;
    type: 'pdf' | 'test';
    fileUrl?: string;
    testId?: string;
    price: number;
    createdAt: any;
}

const AdminPYQsPage = () => {
    const [pyqs, setPyqs] = useState<PYQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const q = query(collection(db, 'pyqs'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPyqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PYQ[];
            setPyqs(fetchedPyqs);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure?')) {
            try {
                await deleteDoc(doc(db, 'pyqs', id));
            } catch (error) {
                console.error("Error deleting PYQ:", error);
            }
        }
    };

    const filteredPyqs = pyqs.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage PYQs</h1>
                    <p className="text-slate-500 mt-1">Upload and manage Previous Year Questions.</p>
                </div>
                <button
                    onClick={() => navigate('/admin-dashboard/pyqs/new')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Add PYQ
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search PYQs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Year</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center py-8"><Loader2 className="animate-spin inline" /></td></tr>
                            ) : filteredPyqs.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-slate-500">No PYQs found.</td></tr>
                            ) : (
                                filteredPyqs.map((pyq) => (
                                    <tr key={pyq.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                                            {pyq.type === 'test' ? <PenTool size={16} className="text-purple-500" /> : <FileText size={16} className="text-blue-500" />}
                                            {pyq.title}
                                        </td>
                                        <td className="px-6 py-4">{pyq.category}</td>
                                        <td className="px-6 py-4">{pyq.year}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${pyq.type === 'test' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {pyq.type === 'test' ? 'Interactive' : 'PDF'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[150px]">
                                            {pyq.type === 'test' ? `ID: ${pyq.testId}` : 'File Link'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {pyq.price === 0 ? <span className="text-green-600">Free</span> : `₹${pyq.price}`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(pyq.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


        </motion.div>
    );
};
export default AdminPYQsPage;
