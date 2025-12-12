import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Users, CheckCircle } from 'lucide-react';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/30 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

                    {/* Left Content (7 Cols) */}
                    <div className="text-center lg:text-left lg:col-span-7 mb-12 lg:mb-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-slate-50 border border-slate-100 shadow-sm mb-6 md:mb-8 transition-transform hover:scale-105 cursor-default">
                            <span className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                            </span>
                            <span className="text-xs md:text-sm font-semibold text-slate-600">Loved by 10,000+ Students</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            Master Your Exams <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">With Confidence.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 lg:px-0">
                            India's most advanced AI-powered mock test platform for <span className="font-semibold text-slate-800">JEE, NEET, and SSC</span>. Get real-time analysis and boost your rank.
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 mb-12 px-4 sm:px-0">
                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                            >
                                Start Free Mock Test
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center"
                            >
                                View Test Series
                            </button>
                        </div>

                        {/* Trust Signals */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 text-slate-400 grayscale opacity-70 text-sm md:text-base">
                            <div className="flex items-center gap-2"><CheckCircle size={16} /> Verified Content</div>
                            <div className="flex items-center gap-2"><Users size={16} /> 24/7 Support</div>
                            <div className="flex items-center gap-2"><Star size={16} /> 4.9/5 Rating</div>
                        </div>
                    </div>

                    {/* Right Visuals (5 Cols) */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative z-10 bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="bg-slate-50 rounded-[2rem] p-8 text-center pb-12 overflow-hidden relative">
                                {/* Abstract UI representation */}
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl">🚀</div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Performance Analytics</h3>
                                <p className="text-slate-500 mb-8">Detailed insights to help you improve.</p>

                                {/* Fake Graph Bars */}
                                <div className="flex items-end justify-center gap-3 h-32 opacity-80">
                                    <div className="w-8 bg-blue-200 rounded-t-lg h-[40%] animate-pulse"></div>
                                    <div className="w-8 bg-blue-300 rounded-t-lg h-[60%]"></div>
                                    <div className="w-8 bg-blue-400 rounded-t-lg h-[30%]"></div>
                                    <div className="w-8 bg-blue-500 rounded-t-lg h-[80%]"></div>
                                    <div className="w-8 bg-indigo-600 rounded-t-lg h-[100%]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badges */}
                        <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce duration-[3000ms]">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">A+</div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase">Result</div>
                                <div className="font-bold text-slate-800">Excellent</div>
                            </div>
                        </div>

                        <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`w - 8 h - 8 rounded - full border - 2 border - white bg - slate - 200 flex items - center justify - center text - xs font - bold text - slate - 500 z - ${i} `}>U{i}</div>
                                ))}
                            </div>
                            <div className="text-sm font-bold text-slate-700">1k+ Online</div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;
