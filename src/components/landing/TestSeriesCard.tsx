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

const TestSeriesCard = ({ title, isNew, features, originalPrice, price, colorTheme = 'blue', onExplore }: TestSeriesProps) => {

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full group">
            {/* Header Strip */}
            <div className={`relative p-6 text-center bg-gradient-to-br ${colorTheme === 'green' ? 'from-green-700 to-green-900' : 'from-slate-800 to-slate-900'}`}>
                {isNew && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                        New
                    </span>
                )}
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📝</div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4 min-h-[3.5rem] flex items-center justify-center">
                    {title}
                </h3>

                <p className="text-sm text-gray-500 text-center mb-6 px-4">
                    Boost your confidence and time management skills.
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                            <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                <div className="text-center mb-6">
                    <span className="text-gray-400 line-through mr-3 text-lg">₹{originalPrice}</span>
                    <span className="text-red-500 text-3xl font-extrabold">₹{price}</span>
                </div>

                <button
                    onClick={onExplore}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${colorTheme === 'green'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-200'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200'
                        }`}
                >
                    Explore Now
                </button>
            </div>
        </div>
    );
};

export default TestSeriesCard;
