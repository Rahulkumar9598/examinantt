import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ShoppingCart,
    Loader2,
    FileText,
    PenTool
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { marketplaceService } from '../services/marketplaceService';

interface PYQ {
    id: string;
    title: string;
    category: string;
    year: string;
    type: 'pdf' | 'test';
    price: number;
    description?: string;
}

const PYQDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth() || {};

    const [pyq, setPyq] = useState<PYQ | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isOwned, setIsOwned] = useState(false);

    useEffect(() => {
        const fetchPYQ = async () => {
            if (!id) return;
            try {
                const pyqDoc = await getDoc(doc(db, 'pyqs', id));
                if (pyqDoc.exists()) {
                    const data = { id: pyqDoc.id, ...pyqDoc.data() } as PYQ;
                    setPyq(data);

                    if (currentUser) {
                        const purchasesRef = collection(db, 'users', currentUser.uid, 'purchases');
                        const q = query(purchasesRef, where('itemId', '==', id));
                        const snapshot = await getDocs(q);
                        if (!snapshot.empty) {
                            setIsOwned(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching PYQ:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPYQ();
    }, [id, currentUser]);

    const location = import('react-router-dom').then(m => m.useLocation); // We will import useLocation properly
    // Actually, we can just use window.location.pathname
    const handleEnroll = async () => {
        if (!currentUser) {
            navigate('/login', { state: { returnTo: window.location.pathname } });
            return;
        }

        if (!pyq) return;

        setIsEnrolling(true);
        try {
            await marketplaceService.processPayment(currentUser.uid, {
                id: pyq.id,
                title: pyq.title,
                price: pyq.price,
                type: 'pyq'
            });
            setIsOwned(true);
            alert('Success! You can now access this paper in your dashboard.');
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Purchase failed", error);
            if (error.message !== "Payment cancelled by user") {
                alert('Failed to unlock: ' + error.message);
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin text-teal-600" size={40} />
            </div>
        );
    }

    if (!pyq) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
                <AlertCircle size={48} className="text-red-500" />
                <h2 className="text-2xl font-bold text-gray-800">PYQ Not Found</h2>
                <button onClick={() => navigate('/pyqs')} className="text-teal-600 hover:underline font-medium">
                    Back to PYQs
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Discovery
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700 uppercase">
                                    {pyq.category}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                    {pyq.year} Edition
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                                {pyq.title}
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {pyq.description || `Prepare with this actual previous year question paper for ${pyq.category} ${pyq.year}. available as a ${pyq.type === 'test' ? 'fully interactive mock test' : 'high-quality PDF'}.`}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Key Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                                        {pyq.type === 'test' ? <PenTool size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{pyq.type === 'test' ? 'Interactive Mock' : 'Downloadable PDF'}</h4>
                                        <p className="text-sm text-slate-500">{pyq.type === 'test' ? 'Real-time scoring & analysis' : 'Ready for offline practice'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Authentic Content</h4>
                                        <p className="text-sm text-slate-500">Verified official exam questions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24">
                            <div className="text-center mb-6">
                                <p className="text-slate-500 text-sm font-medium mb-2">Access Fee</p>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-5xl font-extrabold text-slate-900">
                                        {pyq.price === 0 ? 'Free' : `₹${pyq.price}`}
                                    </span>
                                </div>
                            </div>

                            {isOwned ? (
                                <button
                                    onClick={() => navigate('/dashboard/pyqs')}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Access Now
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={isEnrolling}
                                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm uppercase tracking-widest rounded-[24px] shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isEnrolling ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} />
                                            {pyq.price === 0 ? 'Enroll for Free' : 'Access Now'}
                                        </>
                                    )}
                                </button>
                            )}
                            <p className="text-center text-xs text-slate-400 mt-4">
                                {pyq.price === 0 ? 'Lifetime free access' : 'One-time payment for lifetime access'}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PYQDetailsPage;
