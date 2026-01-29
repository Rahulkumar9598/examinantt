import { CheckCircle } from 'lucide-react';

interface TestSeriesProps {
    title: string;
    isNew?: boolean;
    features: string[];
    originalPrice: string | number;
    price: string | number;
    colorTheme?: 'blue' | 'green';
    onExplore: () => void;
}

const TestSeriesCard = ({ title, isNew, features, originalPrice, price, onExplore }: TestSeriesProps) => {

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 flex flex-col h-full group">
            {/* Header Strip */}
            <div className="relative p-6 text-center bg-gradient-to-br from-[#0B4F97] to-[#1D64D0]">
                {isNew && (
                    <span className="absolute top-4 right-4 bg-white text-[#1D64D0] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        New
                    </span>
                )}
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📝</div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-[#0B4F97] text-center mb-4 min-h-[3.5rem] flex items-center justify-center">
                    {title}
                </h3>

                <p className="text-sm text-slate-500 text-center mb-6 px-4">
                    Boost your confidence and time management skills.
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                            <CheckCircle size={18} className="text-[#1D64D0] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                <div className="text-center mb-6">
                    <span className="text-slate-400 line-through mr-3 text-lg">₹{originalPrice}</span>
                    <span className="text-[#0B4F97] text-3xl font-extrabold">₹{price}</span>
                </div>

                <button
                    onClick={onExplore}
                    className="w-full py-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 bg-[#1D64D0] hover:bg-blue-700 shadow-blue-200"
                >
                    Explore Now
                </button>
            </div>
        </div>
    );
};

export default TestSeriesCard;
