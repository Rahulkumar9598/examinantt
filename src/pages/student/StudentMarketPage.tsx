import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, BookOpen, Search, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface TestSeries {
    id: string;
    title: string;
    category: string;
    price: number;
    description: string;
    questions: any[];
    status: 'draft' | 'published';
}

const StudentMarketPage = () => {
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const [tests, setTests] = useState<TestSeries[]>([]);
    const [purchasedTestIds, setPurchasedTestIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        // Fetch User Purchases
        if (currentUser) {
            const purchasesRef = collection(db, 'users', currentUser.uid, 'purchases');
            const unsubscribePurchases = onSnapshot(purchasesRef, (snapshot) => {
                const ids = new Set(snapshot.docs.map(doc => doc.data().testId));
                setPurchasedTestIds(ids);
            });

            // Fetch Published Tests
            const testsQuery = query(collection(db, 'testSeries'), where('status', '==', 'published'));
            const unsubscribeTests = onSnapshot(testsQuery, (snapshot) => {
                const fetchedTests = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TestSeries[];
                setTests(fetchedTests);
                setIsLoading(false);
            });

            return () => {
                unsubscribePurchases();
                unsubscribeTests();
            };
        }
    }, [currentUser]);

    const handleBuy = async (test: TestSeries) => {
        if (!currentUser) return;
        setBuyingId(test.id);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Add purchase record
            await addDoc(collection(db, 'users', currentUser.uid, 'purchases'), {
                testId: test.id,
                testTitle: test.title,
                category: test.category, // Save category
                price: test.price,
                purchaseDate: serverTimestamp()
            });

            alert('Purchase successful!');
        } catch (error) {
            console.error("Purchase failed", error);
            alert('Purchase failed. Please try again.');
        } finally {
            setBuyingId(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Test Series Market</h1>
                    <p className="text-slate-500 mt-1">Explore and purchase premium test content.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700"
                    >
                        <option value="All">All Categories</option>
                        <option value="NEET">NEET</option>
                        <option value="JEE">JEE</option>
                        <option value="SSC">SSC</option>
                    </select>
                    <div className="relative flex-1 md:flex-none">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : filteredTests.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    No test series found matching your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map((test) => {
                        const isOwned = purchasedTestIds.has(test.id);
                        return (
                            <motion.div
                                key={test.id}
                                variants={itemVariants}
                                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col"
                            >
                                <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative p-6 flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <BookOpen size={100} className="text-white" />
                                    </div>
                                    <div className="flex justify-between items-start z-10">
                                        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/20">
                                            {test.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors mb-2">
                                        {test.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                        {test.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-slate-500 text-sm mb-6 mt-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16} className="text-slate-400" />
                                            <span>Variable</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <PlayCircle size={16} className="text-slate-400" />
                                            <span>{test.questions ? test.questions.length : 0} Qs</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-slate-800">
                                                {test.price === 0 ? 'Free' : `₹${test.price}`}
                                            </div>
                                        </div>
                                        {isOwned ? (
                                            <button
                                                disabled
                                                className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg flex items-center gap-2 cursor-default"
                                            >
                                                <Check size={16} />
                                                Owned
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuy(test)}
                                                disabled={buyingId === test.id}
                                                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {buyingId === test.id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <ShoppingCart size={16} />
                                                )}
                                                Buy Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};
export default StudentMarketPage;
