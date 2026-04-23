import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Lock, Loader2, Search, PenTool, PlayCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';

interface PYQ {
    id: string;
    title: string;
    category: string;
    year: string;
    type?: 'pdf' | 'test';
    fileUrl?: string;
    testId?: string;
    price: number;
}

const StudentPYQsPage = () => {
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const navigate = useNavigate();
    const [pyqs, setPyqs] = useState<PYQ[]>([]);
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [buyingId, setBuyingId] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            // Fetch purchases
            const purchasesRef = collection(db, 'users', currentUser.uid, 'purchases');
            const unsubscribePurchases = onSnapshot(purchasesRef, (snapshot) => {
                // Check either testId or itemId (for future compatibility)
                const ids = new Set(snapshot.docs.map(doc => doc.data().testId || doc.data().itemId));
                setPurchasedIds(ids);
            });

            // Fetch PYQs
            const q = query(collection(db, 'pyqs')); // Removed orderBy to check for index issues
            const unsubscribePyqs = onSnapshot(q, (snapshot) => {
                const fetched = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        title: data.title || data.name || data.testName || 'Untitled PYQ',
                        category: data.category || data.exam || 'General',
                        year: data.year || 'N/A',
                        price: data.price ?? 0
                    };
                }) as PYQ[];
                console.log("PYQs Subscription Data:", fetched);
                if (fetched.length === 0) {
                    console.warn("PYQs collection is empty in Firestore.");
                }
                setPyqs(fetched);
                setIsLoading(false);
            }, (error) => {
                console.error("PYQ subscription error:", error);
                setIsLoading(false);
                alert("Error loading PYQs: " + error.message);
            });

            return () => {
                unsubscribePurchases();
                unsubscribePyqs();
            };
        }
    }, [currentUser]);

    const handleBuy = async (pyq: PYQ) => {
        if (!currentUser) return;
        setBuyingId(pyq.id);
        try {
            await marketplaceService.enrollInItem(currentUser.uid, {
                id: pyq.id,
                title: pyq.title,
                price: pyq.price,
                type: 'pyq'
            });
            alert('Unlocked successfully!');
        } catch (error) {
            console.error("Purchase failed", error);
            alert('Failed to unlock.');
        } finally {
            setBuyingId(null);
        }
    };

    const filteredPyqs = pyqs.filter(item => {
        const search = searchTerm.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(search);
        const categoryMatch = item.category?.toLowerCase().includes(search);
        const yearMatch = item.year?.toString().toLowerCase().includes(search);
        return titleMatch || categoryMatch || yearMatch;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Previous Year Questions</h1>
                    <p className="text-slate-500 mt-1">Practice with authentic questions from past exams.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search PYQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : filteredPyqs.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No PYQs found matching your criteria.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPyqs.map((pyq) => {
                        const isUnlocked = pyq.price === 0 || purchasedIds.has(pyq.id);
                        const isTest = pyq.type === 'test';

                        return (
                            <motion.div
                                key={pyq.id}
                                variants={itemVariants}
                                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {isTest ? <PenTool size={24} /> : <FileText size={24} />}
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">{pyq.category}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">{pyq.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">{pyq.year} • {isTest ? 'Interactive Test' : 'PDF Document'}</p>

                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="font-bold text-slate-800">
                                        {pyq.price === 0 ? 'Free' : `₹${pyq.price}`}
                                    </div>
                                    {isUnlocked ? (
                                        isTest ? (
                                            <button
                                                onClick={() => {
                                                    const message = `Are you sure you want to attempt "${pyq.title}"? The timer will start immediately.`;
                                                    if (window.confirm(message)) {
                                                        const path = (pyq as any).isOMR
                                                            ? `/dashboard/omr-attempt/${pyq.testId}`
                                                            : `/dashboard/attempt/${pyq.testId}`;
                                                        navigate(path);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                            >
                                                <PlayCircle size={16} /> Attempt
                                            </button>
                                        ) : (
                                            <a
                                                href={pyq.fileUrl || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-2"
                                            >
                                                <Download size={16} /> Download
                                            </a>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => handleBuy(pyq)}
                                            disabled={buyingId === pyq.id}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {buyingId === pyq.id ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
                                            Unlock
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};
export default StudentPYQsPage;
