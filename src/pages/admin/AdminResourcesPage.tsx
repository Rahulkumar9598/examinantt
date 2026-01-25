import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, FileText, Video, ExternalLink, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface Resource {
    id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link';
    category: string;
    url: string;
    isFree: boolean;
    createdAt: any;
}

const AdminResourcesPage = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const getIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText size={20} className="text-red-500" />;
            case 'video': return <Video size={20} className="text-blue-500" />;
            default: return <ExternalLink size={20} className="text-slate-500" />;
        }
    };

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Study Resources</h1>
                    <p className="text-slate-500 mt-1">Manage study materials, notes, and videos.</p>
                </div>
                <button
                    onClick={() => navigate('/admin-dashboard/resources/new')}
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
                                <th className="px-6 py-4">Access</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin inline" /></td></tr>
                            ) : filteredResources.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-slate-500">No resources found.</td></tr>
                            ) : (
                                filteredResources.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                {getIcon(resource.type)}
                                            </div>
                                            <div>
                                                <div className="font-bold">{resource.title}</div>
                                                <div className="text-xs text-slate-400 truncate max-w-[200px]">{resource.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                                                {resource.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{resource.type}</td>
                                        <td className="px-6 py-4">
                                            {resource.isFree ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Free</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">
                                                    ₹ {(resource as any).price}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <ExternalLink size={18} />
                                                </a>
                                                <button onClick={() => handleDelete(resource.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        </motion.div>
    );
};
export default AdminResourcesPage;
