import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Lock, Loader2, Search, PenTool, ExternalLink } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/landing/PageLayout';

interface PYQ {
    id: string;
    title: string;
    category: string;
    year: string;
    type: 'pdf' | 'test';
    fileUrl?: string;
    testId?: string;
    price: number;
}

const PYQsDiscoveryPage = () => {
    const navigate = useNavigate();
    const [pyqs, setPyqs] = useState<PYQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'pyqs'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as PYQ[];
            setPyqs(fetched);
            setIsLoading(false);
        }, (error) => {
            console.error("PYQ Discovery Error:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleExplore = (id: string) => {
        navigate(`/pyqs/${id}`);
    };

    const filteredPyqs = pyqs.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageLayout>
            <div className="bg-slate-50 py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Previous Year Questions</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Access authentic previous year questions for JEE, NEET, and SSC. Build your confidence with real exam data.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto mb-12 relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by exam or year..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : filteredPyqs.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 font-medium">No PYQs matching your search.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPyqs.map((pyq) => (
                                <motion.div
                                    key={pyq.id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${pyq.type === 'test' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {pyq.type === 'test' ? <PenTool size={28} /> : <FileText size={28} />}
                                        </div>
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase truncate max-w-[100px]">
                                            {pyq.category}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{pyq.title}</h3>
                                    <p className="text-slate-500 text-sm mb-6 flex items-center gap-2">
                                        <span className="py-1 px-2 bg-slate-50 rounded text-slate-700 font-bold">{pyq.year}</span>
                                        • {pyq.type === 'test' ? 'Interactive Mock' : 'PDF Document'}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="text-lg font-extrabold text-slate-900">
                                            {pyq.price === 0 ? <span className="text-green-600">Free</span> : `₹${pyq.price}`}
                                        </div>
                                        <button
                                            onClick={() => handleExplore(pyq.id)}
                                            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            {pyq.price === 0 ? <ExternalLink size={18} /> : <Lock size={18} />}
                                            Explore
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default PYQsDiscoveryPage;
