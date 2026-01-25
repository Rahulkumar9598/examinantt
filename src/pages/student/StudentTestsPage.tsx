import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Loader2, ChevronDown, ChevronUp, PlayCircle, BookOpen, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
// ... (imports)
import { collection, onSnapshot, query, where, getDocs, orderBy } from 'firebase/firestore';

interface PurchasedTest {
    id: string; // Purchase ID
    seriesId?: string; // New field
    testId: string; // Legacy/Fallback
    testTitle: string; // or seriesTitle
    seriesTitle?: string;
    category?: string;
    price: number;
    purchaseDate: any;
}

interface TestItem {
    id: string;
    name: string;
    settings: {
        duration: number;
    };
    questions?: any[];
    questionIds?: string[];
}

interface Attempt {
    id: string;
    testId: string;
    score: number;
    attemptDate: any;
}

const SeriesCard = ({ purchase, attemptsMap }: { purchase: PurchasedTest, attemptsMap: Record<string, Attempt[]> }) => {
    const navigate = useNavigate();
    const [tests, setTests] = useState<TestItem[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Identify the series ID
    const seriesId = purchase.seriesId || purchase.testId;
    const title = purchase.seriesTitle || purchase.testTitle;

    useEffect(() => {
        const fetchTests = async () => {
            if (!seriesId) return;
            setLoadingTests(true);
            try {
                // Fetch tests belonging to this series
                const q = query(
                    collection(db, 'tests'),
                    where('seriesId', '==', seriesId)
                    // orderBy('createdAt', 'asc') // safe to add if index exists, otherwise filtering is enough
                );
                const snapshot = await getDocs(q);
                const fetchedTests = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TestItem[];
                setTests(fetchedTests);
            } catch (error) {
                console.error("Failed to fetch tests for series", seriesId, error);
            } finally {
                setLoadingTests(false);
            }
        };

        if (isExpanded) {
            fetchTests();
        }
    }, [seriesId, isExpanded]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-5 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {purchase.category || 'Series'}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-0.5">
                            Purchased on {purchase.purchaseDate?.toDate().toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100"
                    >
                        {loadingTests ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="animate-spin text-blue-500" size={24} />
                            </div>
                        ) : tests.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No tests currently available in this series.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {tests.map((test) => {
                                    const testAttempts = attemptsMap[test.id] || [];
                                    const hasAttempted = testAttempts.length > 0;

                                    return (
                                        <div key={test.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors pl-4 md:pl-20 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${hasAttempted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {hasAttempted ? <Award size={18} /> : <Clock size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800">{test.name}</h4>
                                                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                                                        <span>{test.settings?.duration || 180} mins</span>
                                                        <span>•</span>
                                                        <span>{test.questionIds?.length || 0} Questions</span>
                                                        {hasAttempted && (
                                                            <>
                                                                <span className="hidden md:inline">•</span>
                                                                <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                                                    Best Score: {Math.max(...testAttempts.map(a => a.score))}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end md:self-auto">
                                                {hasAttempted && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/dashboard/results');
                                                        }}
                                                        className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors"
                                                    >
                                                        View Result
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (hasAttempted && !window.confirm("Do you want to re-attempt this test? A new attempt record will be created.")) return;
                                                        navigate(`/dashboard/attempt/${test.id}`);
                                                    }}
                                                    className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm ${hasAttempted
                                                        ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-500/20'
                                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                                        }`}
                                                >
                                                    <PlayCircle size={16} />
                                                    {hasAttempted ? 'Re-Attempt' : 'Start Test'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const StudentTestsPage = () => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const [purchasedTests, setPurchasedTests] = useState<PurchasedTest[]>([]);
    const [attemptsMap, setAttemptsMap] = useState<Record<string, Attempt[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            // Fetch Purchases
            const unsubscribePurchases = onSnapshot(collection(db, 'users', currentUser.uid, 'purchases'), (snapshot) => {
                const tests = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as PurchasedTest[];
                setPurchasedTests(tests);
                setIsLoading(false);
            });

            // Fetch Attempts
            const unsubscribeAttempts = onSnapshot(
                query(collection(db, 'users', currentUser.uid, 'attempts'), orderBy('attemptDate', 'desc')),
                (snapshot) => {
                    const attempts = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Attempt[];

                    // Group by testId
                    const map: Record<string, Attempt[]> = {};
                    attempts.forEach(attempt => {
                        if (!map[attempt.testId]) map[attempt.testId] = [];
                        map[attempt.testId].push(attempt);
                    });
                    setAttemptsMap(map);
                }
            );

            return () => {
                unsubscribePurchases();
                unsubscribeAttempts();
            };
        }
    }, [currentUser]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Test Series</h1>
                    <p className="text-slate-500 mt-1">Access your purchased content and start practicing.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/market')}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                    Browse Market
                </button>
            </div>

            {/* Active Series List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-blue-600" size={30} />
                    </div>
                ) : purchasedTests.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <BookOpen size={30} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Series Purchased</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            You haven't enrolled in any test series yet. Visit the market to find high-quality tests for your preparation.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/market')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Explore Market
                        </button>
                    </div>
                ) : (
                    purchasedTests.map((purchase) => (
                        <SeriesCard key={purchase.id} purchase={purchase} attemptsMap={attemptsMap} />
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default StudentTestsPage;
