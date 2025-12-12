import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface PurchasedTest {
    id: string; // Purchase ID
    testId: string;
    testTitle: string;
    category?: string;
    price: number;
    purchaseDate: any;
}

const StudentTestsPage = () => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const [purchasedTests, setPurchasedTests] = useState<PurchasedTest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = onSnapshot(collection(db, 'users', currentUser.uid, 'purchases'), (snapshot) => {
                const tests = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as PurchasedTest[];
                setPurchasedTests(tests);
                setIsLoading(false);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

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

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Tests</h1>
                    <p className="text-slate-500 mt-1">Manage and attempt your purchased test series.</p>
                </div>
            </div>

            {/* Active Tests */}
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Active Series</h2>
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-blue-600" size={30} />
                    </div>
                ) : purchasedTests.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">You haven't purchased any test series yet.</p>
                        <button
                            onClick={() => navigate('/dashboard/market')}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Browse Market
                        </button>
                    </div>
                ) : (
                    purchasedTests.map((test) => (
                        <motion.div
                            key={test.id}
                            variants={itemVariants}
                            className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 md:items-center"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">{test.category || 'Active'}</span>
                                    <h3 className="text-lg font-bold text-slate-800">{test.testTitle}</h3>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><Clock size={16} /> 3 Hours/Test</span>
                                    {/* Placeholder metadata */}
                                    <span className="flex items-center gap-1.5"><Calendar size={16} /> Valid Lifetime</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                    onClick={() => navigate(`/dashboard/attempt/${test.testId}`)}
                                >
                                    Start Test
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Completed Tests History (Mock for visual balance) */}
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 pt-8">History</h2>
            <p className="text-slate-500 text-sm">Completed tests will appear here.</p>
        </motion.div>
    );
};

export default StudentTestsPage;
