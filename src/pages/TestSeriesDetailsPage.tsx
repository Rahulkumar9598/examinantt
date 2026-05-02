import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Clock,
    BookOpen,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ShoppingCart,
    Loader2,
    PlayCircle,
    Zap,
    Sparkles,
    TrendingUp,
    HelpCircle,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTestSeries } from '../services/testSeriesService';
import { marketplaceService } from '../services/marketplaceService';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { TestSeries } from '../types/test.types';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const TestSeriesDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth() || {};

    const [series, setSeries] = useState<TestSeries | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isOwned, setIsOwned] = useState(false);

    useEffect(() => {
        const fetchSeries = async () => {
            if (!id) return;
            try {
                // Fetch Series Details
                const data = await getTestSeries(id);
                setSeries(data);

                // Check ownership if logged in
                if (currentUser && data) {
                    const purchasesRef = collection(db, 'users', currentUser.uid, 'purchases');
                    const q = query(purchasesRef, where('seriesId', '==', id));
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        setIsOwned(true);
                    }
                }
            } catch (error) {
                console.error("Error details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSeries();
    }, [id, currentUser]);

    const handleEnroll = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (!series) return;

        setIsEnrolling(true);
        try {
            await marketplaceService.processPayment(currentUser.uid, {
                ...series,
                id: series.id,
                title: series.name,
                price: series.pricing.type === 'paid' ? series.pricing.amount : 0,
                type: 'testSeries'
            });
            setIsOwned(true);
            alert('Success! You are now enrolled.');
            navigate('/dashboard');
        } catch (error: any) {
            console.error("Enrollment failed:", error);
            if (error.message !== "Payment cancelled by user") {
                alert("Failed to enroll: " + error.message);
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <AlertCircle size={48} className="text-red-500" />
                <h2 className="text-2xl font-bold text-gray-800">Test Series Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:underline font-medium"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-12 transition-all group font-black text-xs uppercase tracking-widest"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 space-y-12"
                    >
                        <div className="relative">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border ${
                                series.examCategory === 'NEET' ? 'bg-green-50 text-green-600 border-green-100' :
                                series.examCategory === 'JEE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-purple-50 text-purple-600 border-purple-100'
                            }`}>
                                <Zap size={12} fill="currentColor" />
                                {series.examCategory} Specialization
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tight">
                                {series.name}
                            </h1>
                            <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl">
                                {series.description}
                            </p>
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-y border-slate-100">
                            {[
                                { label: 'Total Tests', value: series.stats?.totalTests || series.testIds?.length || '10+', icon: PlayCircle, color: 'text-orange-500' },
                                { label: 'Language', value: 'English/Hindi', icon: BookOpen, color: 'text-blue-500' },
                                { label: 'Validity', value: '1 Year', icon: Clock, color: 'text-purple-500' },
                                { label: 'Success Rate', value: '98%', icon: CheckCircle, color: 'text-emerald-500' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                                    <div className={`p-2 rounded-xl bg-slate-50 ${stat.color} mb-3`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div className="text-lg font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Features / Details */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Sparkles className="text-amber-500" />
                                What You'll Get
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Detailed Analytics', desc: 'Real-time performance tracking with heatmaps.', icon: TrendingUp, bg: 'bg-orange-50', text: 'text-orange-600' },
                                    { title: 'Video Solutions', desc: 'Step-by-step video explanations for tricky Qs.', icon: PlayCircle, bg: 'bg-blue-50', text: 'text-blue-600' },
                                    { title: 'Mock Interface', desc: 'Identical to real exam NTA/MCC interfaces.', icon: BookOpen, bg: 'bg-purple-50', text: 'text-purple-600' },
                                    { title: 'Doubt Support', desc: '24/7 priority support for your queries.', icon: HelpCircle, bg: 'bg-emerald-50', text: 'text-emerald-600' },
                                ].map((feature, i) => (
                                    <div key={i} className="group flex items-start gap-5 p-6 bg-white border border-slate-100 rounded-[32px] hover:border-orange-200 transition-all shadow-sm hover:shadow-xl">
                                        <div className={`p-4 rounded-2xl ${feature.bg} ${feature.text} group-hover:scale-110 transition-transform`}>
                                            <feature.icon size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900 mb-2 leading-none">{feature.title}</h4>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar / Pricing Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 p-8 sticky top-32 overflow-hidden group">
                            {/* Decorative Glow */}
                            <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-orange-100/50 blur-[80px] rounded-full group-hover:bg-orange-200/50 transition-colors" />

                            <div className="relative z-10">
                                <div className="text-center mb-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Investment for Future</p>
                                    <div className="flex flex-col items-center">
                                        {series.pricing.type === 'paid' && (
                                            <span className="text-xl text-slate-300 line-through font-bold mb-1">₹{series.pricing.amount ? Math.round(series.pricing.amount * 1.5) : 0}</span>
                                        )}
                                        <span className="text-7xl font-black text-slate-900 tracking-tighter">
                                            {series.pricing.type === 'free' ? 'FREE' : `₹${series.pricing.amount}`}
                                        </span>
                                        {series.pricing.type === 'paid' && (
                                            <div className="mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                                                Save 33% Today
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    {[
                                        'Instant Access to all tests',
                                        'Downloadable solutions PDF',
                                        'All India Rank Prediction',
                                        'Secure Payment Protection'
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-600">
                                            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <CheckCircle size={12} />
                                            </div>
                                            <span className="text-sm font-bold">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                {isOwned ? (
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-widest rounded-[24px] shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Go to Dashboard
                                        <ArrowRight size={18} />
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
                                                {series.pricing.type === 'free' ? 'Enroll for Free' : 'Access Now'}
                                            </>
                                        )}
                                    </button>
                                )}

                                <div className="mt-8 flex items-center justify-center gap-4 grayscale opacity-40">
                                    {/* Mock Trust Badges */}
                                    <div className="w-8 h-8 bg-slate-200 rounded-full" />
                                    <div className="w-8 h-8 bg-slate-200 rounded-full" />
                                    <div className="w-8 h-8 bg-slate-200 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TestSeriesDetailsPage;

