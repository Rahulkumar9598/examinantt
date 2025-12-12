import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X, Save, Loader2, Book, Video } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

interface Resource {
    id: string;
    title: string;
    category: string;
    type: 'Notes' | 'Video';
    fileUrl: string;
    price: number;
    createdAt: any;
}

const AdminResourcesPage = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: 'NEET',
        type: 'Notes',
        fileUrl: '',
        price: '0'
    });

    useEffect(() => {
        const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedResources = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Resource[];
            setResources(fetchedResources);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'resources'), {
                ...formData,
                price: Number(formData.price),
                createdAt: serverTimestamp()
            });
            setIsCreating(false);
            setFormData({ title: '', category: 'NEET', type: 'Notes', fileUrl: '', price: '0' });
        } catch (error) {
            console.error("Error creating resource:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            try {
                await deleteDoc(doc(db, 'resources', id));
            } catch (error) {
                console.error("Error deleting resource:", error);
            }
        }
    };

    const filteredResources = resources.filter(item =>
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
                    <h1 className="text-2xl font-bold text-slate-800">Manage Resources</h1>
                    <p className="text-slate-500 mt-1">Upload study notes, videos, and other materials.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Add Resource
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search resources..."
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
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Link</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-8"><Loader2 className="animate-spin inline" /></td></tr>
                            ) : filteredResources.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No resources found.</td></tr>
                            ) : (
                                filteredResources.map((res) => (
                                    <tr key={res.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                                            {res.type === 'Video' ? <Video size={16} className="text-red-500" /> : <Book size={16} className="text-blue-500" />}
                                            {res.title}
                                        </td>
                                        <td className="px-6 py-4">{res.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${res.type === 'Video' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {res.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[150px]">{res.fileUrl}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">
                                            {res.price === 0 ? <span className="text-green-600">Free</span> : `₹${res.price}`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(res.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsCreating(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">Add New Resource</h2>
                                <button onClick={() => setIsCreating(false)}><X size={24} className="text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Physics Formula Sheet" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white">
                                            <option>NEET</option><option>JEE</option><option>SSC</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white">
                                            <option>Notes</option><option>Video</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Content URL</label>
                                    <input type="url" required value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="https://..." />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input type="checkbox" id="isFreeRes" checked={formData.price === '0'} onChange={e => setFormData({ ...formData, price: e.target.checked ? '0' : '' })} className="w-4 h-4 text-blue-600 rounded" />
                                        <label htmlFor="isFreeRes" className="text-sm font-medium text-slate-700">Free Resource</label>
                                    </div>
                                    <input type="number" disabled={formData.price === '0'} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border rounded-lg disabled:bg-slate-100" placeholder="Price (₹)" />
                                </div>
                                <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                                    <Save size={18} /> Save Resource
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminResourcesPage;
