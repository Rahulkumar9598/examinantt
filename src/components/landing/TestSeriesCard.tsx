import { CheckCircle, ArrowRight, Zap, ScrollText, Award, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface TestSeriesProps {
    title: string;
    description?: string;
    isNew?: boolean;
    features?: string[];
    originalPrice: string | number;
    price: string | number;
    colorTheme?: 'blue' | 'green' | 'orange';
    onExplore?: () => void;
    actions?: ReactNode; // For Admin side
    examCategory?: string;
    testCount?: number;
}

const TestSeriesCard = ({ 
    title, 
    description,
    isNew, 
    features = [], 
    originalPrice, 
    price, 
    onExplore,
    actions,
    examCategory,
    testCount
}: TestSeriesProps) => {

    const themeConfig = {
        blue: {
            bg: 'bg-teal-50/50',
            border: 'border-teal-100',
            text: 'text-teal-600',
            glow: 'shadow-teal-500/20',
            gradient: 'from-teal-600 to-indigo-600',
            iconBg: 'bg-teal-100/50'
        },
        green: {
            bg: 'bg-emerald-50/50',
            border: 'border-emerald-100',
            text: 'text-emerald-600',
            glow: 'shadow-emerald-500/20',
            gradient: 'from-emerald-600 to-teal-600',
            iconBg: 'bg-emerald-100/50'
        },
        orange: {
            bg: 'bg-teal-50/50',
            border: 'border-teal-100',
            text: 'text-teal-600',
            glow: 'shadow-teal-500/20',
            gradient: 'from-teal-600 to-teal-600',
            iconBg: 'bg-teal-100/50'
        }
    };

    const currentTheme = themeConfig[examCategory === 'NEET' ? 'green' : examCategory === 'JEE' ? 'blue' : 'orange'];

    return (
        <motion.div 
            whileHover={{ y: -12, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative h-full flex flex-col bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 overflow-hidden transition-all duration-500"
        >
            {/* Top Pattern Overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-100/50 rounded-bl-[100px] pointer-events-none" />
            
            {/* Main Content Area */}
            <div className="p-7 md:p-8 flex-1 flex flex-col relative z-10">
                {/* Header: Category & Badge */}
                <div className="flex justify-between items-center mb-8">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${currentTheme.text.replace('text', 'bg')} animate-pulse`} />
                        {examCategory || 'Academic'}
                    </div>
                    
                    {isNew && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                            <Sparkles size={12} className="text-teal-400" />
                            <span>New Launch</span>
                        </div>
                    )}
                </div>

                {/* Title & Description */}
                <div className="mb-8">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-[1.1] tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all duration-300 min-h-[3.3rem]">
                        {title}
                    </h3>
                    <p className="mt-4 text-sm font-medium text-slate-500 leading-relaxed line-clamp-2 italic">
                        {description || "Premium curated test series designed by experts to help you master every concept."}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all duration-300 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${currentTheme.iconBg} ${currentTheme.text}`}>
                                <ScrollText size={20} />
                            </div>
                            <div>
                                <div className="text-base font-black text-slate-900">{testCount || 15}+</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Full Tests</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all duration-300 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-base font-black text-slate-900">12k+</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Enrolled</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="space-y-3.5 mb-8">
                    {features.length > 0 ? (
                        features.slice(0, 3).map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 group/item">
                                <div className={`shrink-0 w-5 h-5 rounded-lg ${currentTheme.bg} ${currentTheme.text} flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                                    <CheckCircle size={14} strokeWidth={3} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 tracking-tight">{feature}</span>
                            </div>
                        ))
                    ) : (
                        ['Detailed Performance Analytics', 'All India Ranking (AIR)', 'Step-by-step Video Solutions'].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 group/item">
                                <div className={`shrink-0 w-5 h-5 rounded-lg ${currentTheme.bg} ${currentTheme.text} flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                                    <CheckCircle size={14} strokeWidth={3} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 tracking-tight">{feature}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Pricing Area */}
                <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Award size={14} className="text-teal-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Content</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                {price === 'Free' || price === '0' || !price ? 'FREE' : `₹${price}`}
                            </span>
                            {price && price !== 'Free' && price !== '0' && (
                                <span className="text-slate-300 line-through text-sm font-bold">₹{originalPrice}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className={`w-14 h-14 rounded-3xl ${currentTheme.bg} flex items-center justify-center ${currentTheme.text} group-hover:scale-110 transition-transform duration-500`}>
                        <Zap size={28} fill="currentColor" className="opacity-20" />
                        <Zap size={28} className="absolute" />
                    </div>
                </div>
            </div>

            {/* Action Button Section */}
            <div className="px-7 md:px-8 pb-8 pt-2">
                {actions ? (
                    <div className="relative z-10">
                        {actions}
                    </div>
                ) : (
                    <button
                        onClick={onExplore}
                        className="w-full relative group/btn h-16 rounded-[1.5rem] bg-slate-900 hover:bg-teal-600 shadow-2xl shadow-slate-900/10 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                        
                        <span className="relative z-10 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                            Access Series
                            <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                        </span>
                        
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradient} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500`} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default TestSeriesCard;
