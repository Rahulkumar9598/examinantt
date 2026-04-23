import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import type { TestSeries } from '../../types/test.types';
import { getAllTestSeries } from '../../services/testSeriesService';
import TestSeriesCard from '../../components/landing/TestSeriesCard';
import { loadRazorpay } from '../../utils/razorpay';
import { studentService } from '../../services/studentService';

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
            if (series.pricing?.type === 'paid' && (series.pricing.amount || 0) > 0) {
                // --- PAID: Open Razorpay ---
                const res = await loadRazorpay();
                if (!res) {
                    alert('Razorpay SDK failed to load. Are you online?');
                    setEnrollingId(null);
                    return;
                }

                const options = {
                    key: 'rzp_test_S7lSvWtu89c6zD',
                    amount: (series.pricing.amount || 0) * 100,
                    currency: 'INR',
                    name: 'Examinant',
                    description: `Purchase: ${series.name}`,
                    image: 'https://examinantt.web.app/logo192.png',
                    handler: async function (_response: any) {
                        try {
                            await studentService.enrollInTestSeries(currentUser.uid, series);
                            alert('Payment Successful! You are now enrolled.');
                        } catch (err) {
                            console.error("Enrollment error after payment:", err);
                            alert("Payment successful but enrollment failed. Please contact support.");
                        }
                    },
                    prefill: {
                        name: currentUser.displayName || 'Student',
                        email: currentUser.email || 'student@example.com',
                        contact: ''
                    },
                    notes: { address: 'Examinant' },
                    theme: { color: '#3399cc' },
                    modal: {
                        ondismiss: () => setEnrollingId(null)
                    }
                };

                const paymentObject = new (window as any).Razorpay(options);
                paymentObject.open();
                setEnrollingId(null); // reset — modal is open, handler takes over
            } else {
                // --- FREE: Direct Enroll ---
                await addDoc(collection(db, 'users', currentUser.uid, 'purchases'), {
                    seriesId: series.id,
                    testId: series.id,
                    type: 'series',
                    seriesTitle: series.name,
                    testTitle: series.name,
                    category: series.examCategory,
                    price: 0,
                    purchaseDate: serverTimestamp()
                });
                alert('Enrolled successfully! Go to My Tests to start.');
                setEnrollingId(null);
            }
        } catch (error) {
            console.error("Enrollment failed", error);
            alert('Failed. Please try again.');
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
                                className="w-full h-14 rounded-2xl bg-green-500 text-white font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 cursor-default shadow-lg shadow-green-500/20"
                            >
                                <span>✓</span> Enrolled
                            </button>
                        ) : isBuying ? (
                            <button
                                disabled
                                className="w-full h-14 rounded-2xl bg-orange-400 text-white font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 cursor-wait"
                            >
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                {isFree ? 'Enrolling...' : 'Processing...'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleBuy(series)}
                                className="w-full relative group/btn overflow-hidden rounded-2xl h-14 bg-gradient-to-r from-orange-500 to-amber-600 shadow-xl shadow-orange-500/10 active:scale-95 transition-all"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-[0.15em]">
                                    {isFree ? 'Enroll Now — Free' : `Unlock Series — ₹${series.pricing.amount}`}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
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

