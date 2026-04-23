// import { useNavigate } from 'react-router-dom';
// import { ArrowRight, CheckCircle, Star } from 'lucide-react';

// const HeroSection = () => {
//     const navigate = useNavigate();

//     return (
//         <section className="relative min-h-screen flex flex-col lg:block overflow-hidden bg-white pt-16 lg:pt-20">
//             {/* Background Split Decor - Only for Desktop */}
//             <div className="absolute inset-0 hidden lg:flex flex-row">
//                 <div className="w-[42%] bg-[#0B4F97] relative h-full">
//                     <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
//                         <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] border-[40px] border-white rounded-full blur-[100px]"></div>
//                     </div>
//                 </div>
//                 <div className="w-[58%] bg-white h-full"></div>
//             </div>

//             <div className="max-w-7xl mx-auto lg:px-8 relative z-10 w-full flex-grow flex flex-col lg:block">
//                 <div className="grid lg:grid-cols-12 flex-grow">

//                     {/* Left Banner Content (Navy on Mobile, Overlay on Desktop) */}
//                     <div className="lg:col-span-5 bg-[#0B4F97] lg:bg-transparent text-white px-4 sm:px-6 py-12 lg:py-20 lg:pr-12">
//                         {/* Redundant Logo removed on mobile, kept on desktop for split layout feel */}


//                         <div className="space-y-6 lg:space-y-8">
//                             <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
//                                 An AI-Powered <br />
//                                 <span className="text-blue-300">Semi-Offline</span> <br />
//                                 Mock Test Platform
//                             </h2>

//                             <p className="text-blue-100/80 text-base lg:text-lg max-w-sm leading-relaxed">
//                                 Practice online. Mark on real OMR sheets. <br className="hidden sm:block" />
//                                 <span className="text-white font-semibold">Get AI-driven performance analysis.</span>
//                             </p>

//                             <ul className="space-y-3 lg:space-y-4 pt-2 lg:pt-4">
//                                 {[
//                                     "Real Exam-Like OMR Practice",
//                                     "Time-Scheduled Mock Tests",
//                                     "Expert-Curated Question Papers",
//                                     "Smart Performance & Mistake Analysis"
//                                 ].map((item, i) => (
//                                     <li key={i} className="flex items-start gap-3 text-sm font-medium group text-blue-50/90">
//                                         <div className="bg-blue-400/20 p-1 rounded-full group-hover:bg-blue-400/40 transition-colors">
//                                             <CheckCircle size={14} className="text-blue-300 shrink-0" />
//                                         </div>
//                                         <span className="pt-0.5">{item}</span>
//                                     </li>
//                                 ))}
//                             </ul>

//                             <div className="pt-6 lg:pt-10">
//                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-4 opacity-70">Prepared for:</p>
//                                 <div className="flex gap-3 sm:gap-4">
//                                     {['NEET', 'JEE', 'SSC'].map(cat => (
//                                         <span key={cat} className="px-4 lg:px-5 py-2 bg-white/10 rounded-xl text-[10px] sm:text-xs font-black backdrop-blur-md border border-white/10 tracking-widest uppercase hover:bg-white/20 hover:scale-105 transition-all cursor-default">
//                                             {cat}
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Content Area (White background) */}
//                     <div className="lg:col-span-7 bg-white px-4 sm:px-6 py-12 lg:py-20 lg:pl-10">
//                         <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black text-[#1D64D0] uppercase tracking-[0.2em] mb-6 lg:mb-8">
//                             Next Gen Testing Environment
//                         </div>

//                         <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black text-[#0B4F97] leading-[1.1] mb-6 lg:mb-8 tracking-tighter">
//                             Practice That <br className="hidden sm:block" />
//                             Makes You <br className="hidden sm:block" />
//                             <span className="text-[#1D64D0] relative inline-block">
//                                 Exam-Ready.
//                                 <div className="absolute -bottom-1 lg:-bottom-2 left-0 w-full h-1.5 lg:h-2 bg-blue-100 -z-10 rounded-full"></div>
//                             </span>
//                         </h1>

//                         <p className="text-lg lg:text-xl text-slate-500 mb-8 lg:mb-10 max-w-xl font-medium leading-relaxed">
//                             Not Just Test-Ready. We bridge the gap between simple practice and the high-pressure environment of the real exam.
//                         </p>

//                         <div className="flex flex-col sm:flex-row gap-4 lg:gap-5 mb-12 lg:mb-16">
//                             <button
//                                 onClick={() => navigate('/signup')}
//                                 className="px-8 lg:px-10 py-4 lg:py-5 bg-[#1D64D0] hover:bg-blue-700 text-white rounded-[15px] lg:rounded-[20px] font-black text-lg lg:text-xl shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 group"
//                             >
//                                 Get Started
//                                 <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
//                             </button>
//                             <button
//                                 className="px-8 lg:px-10 py-4 lg:py-5 bg-white text-[#1D64D0] border-2 border-[#1D64D0] rounded-[15px] lg:rounded-[20px] font-black text-lg lg:text-xl hover:bg-blue-50 transition-all flex items-center justify-center active:scale-95"
//                             >
//                                 Try Demo Test (Free)
//                             </button>
//                         </div>

//                         <div className="flex items-center gap-6 lg:gap-8 pt-8 lg:pt-10 border-t border-slate-100 flex-wrap">
//                             <div className="flex -space-x-3 lg:-space-x-4">
//                                 {[1, 2, 3, 4, 5].map(i => (
//                                     <div key={i} className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-[2px] lg:border-[3px] border-white bg-slate-100 shadow-lg overflow-hidden ring-1 ring-slate-100 transition-transform hover:-translate-y-1 hover:z-10 cursor-pointer">
//                                         <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
//                                     </div>
//                                 ))}
//                                 <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full border-[2px] lg:border-[3px] border-white bg-[#1D64D0] flex items-center justify-center text-[10px] lg:text-xs font-bold text-white shadow-lg">
//                                     +10k
//                                 </div>
//                             </div>
//                             <div>
//                                 <div className="flex text-yellow-400 mb-0.5 lg:mb-1">
//                                     {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="lg:size-[18px]" fill="currentColor" />)}
//                                 </div>
//                                 <p className="text-[10px] lg:text-sm text-slate-500 font-bold uppercase tracking-wider">
//                                     Trusted by <span className="text-[#0B4F97] font-black">10,000+</span> Aspirants
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default HeroSection;
// ---------------------------------------------------------------------------------------------
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, BookOpen, Trophy, BarChart3 } from 'lucide-react';

type HeroSectionProps = {
    onGetStarted?: () => void;
};

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (onGetStarted) return onGetStarted();
        navigate('/signup');
    };

    return (
        <section className="bg-white relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-10 space-y-12 relative">

                {/* HERO */}
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                        Practice That Makes You{" "}
                        <span className="text-blue-600 relative inline-block">
                            Exam-Ready
                            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                                <path d="M1 5.5C66.5 2.5 133.5 2.5 199 5.5" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                        Not Just Test-Ready. We bridge the gap between simple practice and the high-pressure environment of the real exam.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={handleGetStarted}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                        >
                            Get Started
                            <ArrowRight size={18} />
                        </button>

                        <button className="w-full sm:w-auto px-6 py-3 bg-white border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50">
                            Try Demo Test (Free)
                        </button>
                    </div>
                </div>

                {/* FEATURES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                            <BookOpen className="text-blue-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">AI-Powered Platform</h3>
                        <p className="text-xs text-gray-500">An AI-Powered Semi-Offline Mock Test Platform</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                            <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">OMR Practice</h3>
                        <p className="text-xs text-gray-500">Practice online. Mark on real OMR sheets.</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                            <BarChart3 className="text-purple-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">AI Performance Analysis</h3>
                        <p className="text-xs text-gray-500">Get AI-driven performance analysis.</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-3">
                            <Trophy className="text-orange-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">Exam Categories</h3>
                        <p className="text-xs text-gray-500">NEET • JEE • SSC</p>
                    </div>

                </div>

                {/* TRUST */}
                <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <img
                                        key={i}
                                        src={`https://i.pravatar.cc/100?u=${i}`}
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white"
                                    />
                                ))}
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                                    +10k
                                </div>
                            </div>

                            <div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600">
                                    Trusted by <span className="font-semibold text-blue-600">10,000+</span>
                                </p>
                            </div>
                        </div>

                        <span className="text-xs sm:text-sm bg-white px-3 py-1.5 rounded-md text-gray-700">
                            Next Gen Testing Environment
                        </span>
                    </div>
                </div>

                {/* WHY + CTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="bg-white border border-gray-100 rounded-lg p-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">Why Choose Us?</h3>
                        <ul className="space-y-2">
                            {[
                                "Real Exam-Like OMR Practice",
                                "Time-Scheduled Mock Tests",
                                "Expert-Curated Question Papers",
                                "Smart Performance & Mistake Analysis"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle size={14} className="text-green-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-5 text-white flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-semibold mb-2">Ready to Start Your Journey?</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Join thousands of successful students who achieved their dreams with us.
                            </p>
                        </div>

                        <button
                            onClick={handleGetStarted}
                            className="w-full sm:w-auto px-5 py-2 bg-white text-blue-600 font-semibold rounded-md"
                        >
                            Get Started Free
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;
