import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import type { TestSeries } from '../../types/test.types';
import { getAllTestSeries } from '../../services/testSeriesService';
import TestSeriesCard from '../../components/landing/TestSeriesCard';

const StudentMarketPage = () => {
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const [tests, setTests] = useState<TestSeries[]>([]);
    const [purchasedTestIds, setPurchasedTestIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Fetch Tests (Real Data)
    useEffect(() => {
        const fetchTests = async () => {
            try {
                const data = await getAllTestSeries({ status: 'published' });
                console.log(data);
                setTests(data);
            } catch (error) {
                console.error("Error fetching test series:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTests();
    }, []);

    // Fetch User Purchases
    useEffect(() => {
        if (currentUser) {
            const purchasesRef = collection(db, 'users', currentUser.uid, 'purchases');
            const unsubscribePurchases = onSnapshot(purchasesRef, (snapshot) => {
                const ids = new Set(snapshot.docs.map(doc => doc.data().seriesId || doc.data().testId));
                setPurchasedTestIds(ids);
            });
            return () => unsubscribePurchases();
        }
    }, [currentUser]);

    const handleBuy = async (series: TestSeries) => {
        if (!currentUser) return;

        // If already owned, maybe navigate to tests?
        if (purchasedTestIds.has(series.id)) {
            // navigate to tests
            return;
        }

        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'purchases'), {
                seriesId: series.id,
                testId: series.id,
                type: 'series',
                seriesTitle: series.name,
                testTitle: series.name,
                category: series.examCategory,
                price: series.pricing.type === 'free' ? 0 : series.pricing.amount,
                purchaseDate: serverTimestamp()
            });

            alert('Purchase successful!');
        } catch (error) {
            console.error("Purchase failed", error);
            alert('Purchase failed. Please try again.');
        }
    };

    const filteredTests = tests.filter(test => {
        // Safe access to name/title
        const seriesName = test.name || (test as any).title || '';
        const category = test.examCategory || '';

        const matchesSearch = seriesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTests.map((series) => {
                        const isOwned = purchasedTestIds.has(series.id);
                        // Safe Access to properties
                        const title = series.name || (series as any).title || "Untitled Series";
                        const features = (series as any).features && Array.isArray((series as any).features)
                            ? (series as any).features
                            : [series.description || "No description available"];

                        return (
                            <div key={series.id}>
                                <TestSeriesCard
                                    title={title}
                                    isNew={!!(series as any).isNew}
                                    features={features}
                                    originalPrice={series.pricing?.type === 'paid' ? `${(series.pricing.amount || 0) * 1.5}` : '0'}
                                    price={series.pricing?.type === 'paid' ? `${series.pricing.amount}` : 'Free'}
                                    colorTheme={series.examCategory === 'NEET' ? 'green' : 'blue'}
                                    onExplore={() => handleBuy(series)}
                                />
                                {isOwned && (
                                    <div className="mt-2 text-center">
                                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            Already Owned
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default StudentMarketPage;

