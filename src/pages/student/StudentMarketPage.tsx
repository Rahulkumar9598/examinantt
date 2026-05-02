import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import type { TestSeries } from '../../types/test.types';
import { getAllTestSeries } from '../../services/testSeriesService';
import TestSeriesCard from '../../components/landing/TestSeriesCard';
import { marketplaceService } from '../../services/marketplaceService';

const StudentMarketPage = () => {
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const [tests, setTests] = useState<TestSeries[]>([]);
    const [purchasedTestIds, setPurchasedTestIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [enrollingId, setEnrollingId] = useState<string | null>(null);

    // Fetch Tests (Real Data)
    useEffect(() => {
        const fetchTests = async () => {
            try {
                // 1. First try fetching only published
                let data = await getAllTestSeries({ status: 'published' });
                
                // 2. If no published found, fetch all (for development/testing visibility)
                if (data.length === 0) {
                    console.warn("No published series found, fetching all series for visibility.");
                    data = await getAllTestSeries();
                }

                console.log("Marketplace Data Loaded:", data);
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
        if (purchasedTestIds.has(series.id)) return;

        setEnrollingId(series.id);
        try {
            await marketplaceService.processPayment(currentUser.uid, {
                ...series,
                id: series.id,
                title: series.name,
                price: series.pricing?.type === 'paid' ? series.pricing.amount : 0,
                type: 'testSeries'
            });
            alert('Success! You are now enrolled.');
            setEnrollingId(null);
        } catch (error: any) {
            console.error("Enrollment failed", error);
            if (error.message !== "Payment cancelled by user") {
                alert('Failed: ' + error.message);
            }
            setEnrollingId(null);
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Test Series Market</h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Hand-picked premium series for your success.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-6 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 bg-white text-slate-700 font-bold shadow-sm transition-all cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        <option value="NEET">NEET UG</option>
                        <option value="JEE">JEE Mains/Adv</option>
                        <option value="SSC">SSC Exams</option>
                    </select>
                    <div className="relative flex-1 sm:w-80">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find your goal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold shadow-sm"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredTests.map((series) => {
                        const isOwned = purchasedTestIds.has(series.id);
                        const isBuying = enrollingId === series.id;
                        const isFree = series.pricing?.type === 'free' || !series.pricing?.amount || series.pricing.amount === 0;
                        const title = series.name;

                        // Build the custom action button
                        const actionButton = isOwned ? (
                            <button
                                disabled
                                className="w-full h-16 rounded-[1.5rem] bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-default shadow-xl shadow-emerald-500/20"
                            >
                                <CheckCircle size={20} strokeWidth={3} /> Enrolled & Active
                            </button>
                        ) : isBuying ? (
                            <button
                                disabled
                                className="w-full h-16 rounded-[1.5rem] bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-wait"
                            >
                                <Loader2 className="animate-spin" size={20} />
                                {isFree ? 'Enrolling...' : 'Processing...'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleBuy(series)}
                                className="w-full relative group/btn h-16 rounded-[1.5rem] bg-slate-900 hover:bg-orange-600 shadow-2xl shadow-slate-900/10 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-[0.2em]">
                                    {isFree ? 'Enroll for Free' : `Access Now for ₹${series.pricing.amount}`}
                                    <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                            </button>
                        );

                        return (
                            <div key={series.id} className="relative">
                                <TestSeriesCard
                                    title={title}
                                    description={series.description}
                                    isNew={!!(series as any).isNew}
                                    features={(series as any).features || []}
                                    originalPrice={series.pricing?.type === 'paid' ? `${(series.pricing.amount || 0) * 1.5}` : '0'}
                                    price={series.pricing?.type === 'paid' ? `${series.pricing.amount}` : 'Free'}
                                    colorTheme="orange"
                                    examCategory={series.examCategory}
                                    testCount={(series as any).testIds?.length || 0}
                                    actions={actionButton}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default StudentMarketPage;


