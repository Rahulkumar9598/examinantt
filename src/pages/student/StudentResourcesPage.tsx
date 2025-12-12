import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Video, Lock, Loader2, Search, PlayCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface Resource {
    id: string;
    title: string;
    category: string;
    type: 'Notes' | 'Video';
    fileUrl: string;
    price: number;
}

const StudentResourcesPage = () => {
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const [resources, setResources] = useState<Resource[]>([]);
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [buyingId, setBuyingId] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            const purchasesRef = collection(db, 'users', currentUser.uid, 'purchases');
            const unsubscribePurchases = onSnapshot(purchasesRef, (snapshot) => {
                const ids = new Set(snapshot.docs.map(doc => doc.data().testId || doc.data().itemId));
                setPurchasedIds(ids);
            });

            const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
            const unsubscribeResources = onSnapshot(q, (snapshot) => {
                const fetched = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Resource[];
                setResources(fetched);
                setIsLoading(false);
            });

            return () => {
                unsubscribePurchases();
                unsubscribeResources();
            };
        }
    }, [currentUser]);

    const handleBuy = async (res: Resource) => {
        if (!currentUser) return;
        setBuyingId(res.id);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulating payment
            await addDoc(collection(db, 'users', currentUser.uid, 'purchases'), {
                itemId: res.id,
                title: res.title,
                type: 'resource',
                resourceType: res.type,
                price: res.price,
                purchaseDate: serverTimestamp()
            });
            alert('Resource unlocked successfully!');
        } catch (error) {
            console.error("Purchase failed", error);
            alert('Failed to unlock.');
        } finally {
            setBuyingId(null);
        }
    };

    const filteredResources = resources.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-2xl font-bold text-slate-800">Learning Resources</h1>
                    <p className="text-slate-500 mt-1">Study notes, video lectures, and more.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : filteredResources.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No resources found matching your criteria.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((res) => {
                        const isUnlocked = res.price === 0 || purchasedIds.has(res.id);
                        const Icon = res.type === 'Video' ? Video : Book;

                        return (
                            <motion.div
                                key={res.id}
                                variants={itemVariants}
                                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${res.type === 'Video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">{res.category}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">{res.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">{res.type}</p>

                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="font-bold text-slate-800">
                                        {res.price === 0 ? 'Free' : `₹${res.price}`}
                                    </div>
                                    {isUnlocked ? (
                                        <a
                                            href={res.fileUrl || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            {res.type === 'Video' ? <PlayCircle size={16} /> : <Book size={16} />}
                                            {res.type === 'Video' ? 'Watch' : 'Open'}
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => handleBuy(res)}
                                            disabled={buyingId === res.id}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {buyingId === res.id ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
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

export default StudentResourcesPage;
