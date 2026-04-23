import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Loader2, ChevronDown, ChevronUp, PlayCircle, BookOpen, Award, FileText, Camera } from 'lucide-react';
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
    omrTemplate?: { totalQuestions: number };
}

interface Attempt {
    id: string;
    testId: string;
    score: number;
    attemptDate: any;
}

const AttemptModeModal = ({ isOpen, onClose, onConfirm, testName }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onConfirm: (mode: 'digital' | 'omr') => void,
    testName: string
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-8 text-white relative">
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            >
                                <ChevronUp className="rotate-180" size={20} />
                            </button>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4 backdrop-blur-sm shadow-xl">
                                    🚀
                                </div>
                                <h2 className="text-2xl font-bold mb-1">Choose Attempt Mode</h2>
                                <p className="text-orange-100 opacity-90 text-sm">{testName}</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-4">
                            <button
                                onClick={() => onConfirm('digital')}
                                className="w-full group p-5 border-2 border-slate-100 rounded-2xl flex items-center gap-5 hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                            >
                                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <BookOpen size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 text-lg">Interactive Digital Mode</h3>
                                    <p className="text-slate-500 text-sm">Real-time interface with question timer and navigation.</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                    <ChevronUp className="rotate-90" size={16} />
                                </div>
                            </button>

                            <button
                                onClick={() => onConfirm('omr')}
                                className="w-full group p-5 border-2 border-slate-100 rounded-2xl flex items-center gap-5 hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
                            >
                                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <FileText size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 text-lg">OMR Sheet Simulation</h3>
                                    <p className="text-slate-500 text-sm">Bubble sheet simulation with PDF question paper support.</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                    <ChevronUp className="rotate-90" size={16} />
                                </div>
                            </button>

                            <p className="text-center text-[11px] text-slate-400 mt-4 uppercase tracking-[0.15em] font-bold">
                                You can attempt the same test in both modes
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const SeriesCard = ({ purchase, attemptsMap }: { purchase: PurchasedTest, attemptsMap: Record<string, Attempt[]> }) => {
    const navigate = useNavigate();
    const [tests, setTests] = useState<TestItem[]>([]);
    const [loadingTests, setLoadingTests] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Modal State
    const [isModeModalOpen, setIsModeModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);


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
                                                        <span>{test.questionIds?.length || test.omrTemplate?.totalQuestions || 0} Questions</span>
                                                        {(test as any).isOMR && (
                                                            <>
                                                                <span className="hidden md:inline">•</span>
                                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">📄 OMR</span>
                                                            </>
                                                        )}
                                                        {hasAttempted && (
                                                            <>
                                                                <span className="hidden md:inline">•</span>
                                                                {Math.max(...testAttempts.map(a => a.score)) > 0 ? (
                                                                    <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                                                                        Best Score: {Math.max(...testAttempts.map(a => a.score))}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                                                                        Attempted
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end md:self-auto flex-wrap justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/dashboard/print-omr/${test.id}`, '_blank');
                                                    }}
                                                    className="px-4 py-2 border border-blue-200 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                                                    title="Download Blank OMR Sheet"
                                                >
                                                    <FileText size={16} />
                                                    Download
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/dashboard/omr-scan');
                                                    }}
                                                    className="px-4 py-2 border border-amber-200 text-amber-600 text-sm font-bold rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2"
                                                    title="Upload Filled OMR"
                                                >
                                                    <Camera size={16} />
                                                    Scan OMR
                                                </button>
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
                                                        setSelectedTest(test);
                                                        setIsModeModalOpen(true);
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

                <AttemptModeModal 
                    isOpen={isModeModalOpen}
                    onClose={() => setIsModeModalOpen(false)}
                    testName={selectedTest?.name || ''}
                    onConfirm={(mode) => {
                        if (!selectedTest) return;
                        setIsModeModalOpen(false);
                        const path = mode === 'omr' 
                            ? `/dashboard/omr-attempt/${selectedTest.id}` 
                            : `/dashboard/attempt/${selectedTest.id}`;
                        navigate(path);
                    }}
                />
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
