import { CheckCircle, ArrowRight, Zap, Target, ScrollText, Clock3, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

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
    colorTheme = 'orange', 
    onExplore,
    actions,
    examCategory,
    testCount
}: TestSeriesProps) => {

    return (
        <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] transition-all duration-500 flex flex-col h-full group relative"
        >
            {/* Academic Header Accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>

            {/* Category Badge & Status */}
            <div className="pt-6 px-6 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        {examCategory || 'Academic'} Preparation
                    </span>
                </div>
                {isNew && (
                    <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100 animate-bounce">
                        <Sparkles size={10} />
                        <span className="text-[9px] font-black uppercase tracking-wider">New Launch</span>
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
                {/* Title & Description */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-300 min-h-[3.5rem] line-clamp-2 leading-tight tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {description || "Master your concepts with our expert-prepared test series covering all core topics."}
                    </p>
                </div>

                {/* Educational Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-orange-500">
                            <ScrollText size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-900 leading-tight">{testCount || 10}+ Tests</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Mock Series</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                            <Target size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-900 leading-tight">Expert Level</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Curated Qs</span>
                        </div>
                    </div>
                </div>

                {/* Quick Feature List */}
                <ul className="space-y-3 mb-8">
                    {features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-600">
                            <div className="shrink-0 w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle size={12}  />
                            </div>
                            <span className="text-xs font-semibold leading-none">{feature}</span>
                        </li>
                    ))}
                </ul>

                {/* Footer Section */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <Award size={10} className="text-amber-500" />
                                Official Access
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold text-slate-900">
                                    {price === 'Free' || price === '0' || !price ? 'FREE' : `₹${price}`}
                                </span>
                                {price && price !== 'Free' && price !== '0' && (
                                    <span className="text-slate-300 line-through text-sm font-bold">₹{originalPrice}</span>
                                )}
                            </div>
                        </div>
                        <div className="text-orange-500/20 group-hover:text-orange-500/40 transition-colors">
                            <Zap size={32} />
                        </div>
                    </div>

                    {/* Action Area (NO BLACK BUTTONS) */}
                    {actions ? (
                        <div className="flex gap-2">
                            {actions}
                        </div>
                    ) : (
                        <button
                            onClick={onExplore}
                            className="w-full relative group/btn overflow-hidden rounded-2xl h-14 bg-gradient-to-r from-orange-500 to-amber-600 shadow-xl shadow-orange-500/10 active:scale-95 transition-all"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-[0.15em]">
                                Unlock Series Now
                                <ArrowRight size={18} className="group-hover/btn:translate-x-1.5 transition-transform" />
                            </span>
                            {/* Shiny Overlay Effect */}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default TestSeriesCard;
