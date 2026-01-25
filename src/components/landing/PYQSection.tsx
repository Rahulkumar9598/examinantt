import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';

interface PYQ {
    id: string;
    title: string;
    category: string;
}

const PYQSection = () => {
    const navigate = useNavigate();
    const [groupedPyqs, setGroupedPyqs] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'pyqs'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Record<string, string[]> = {};

            snapshot.docs.forEach(doc => {
                const pyq = doc.data() as PYQ;
                const cat = pyq.category || 'General';
                if (!data[cat]) {
                    data[cat] = [];
                }
                if (data[cat].length < 3) {
                    data[cat].push(pyq.title);
                }
            });

            setGroupedPyqs(data);
            setIsLoading(false);
        }, (error) => {
            console.error("Landing PYQ Fetch Error:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const categories = Object.keys(groupedPyqs);
    const accents = ['orange', 'green', 'blue', 'purple', 'rose'];

    return (
        <section id="resources" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 text-sm font-bold uppercase tracking-wide mb-4">Resources</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Explore PYQs (Free)</h2>
                    <p className="text-blue-600 font-medium text-lg">
                        Access previous year questions to boost your preparation
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 italic bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        No previous year questions available yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((cat, idx) => {
                            const accent = accents[idx % accents.length];

                            return (
                                <div key={cat} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                                    {/* Top Border Accent */}
                                    <div className={`absolute top-0 left-0 w-full h-1.5 ${accent === 'orange' ? 'bg-orange-500' :
                                            accent === 'green' ? 'bg-green-500' :
                                                accent === 'blue' ? 'bg-blue-500' :
                                                    accent === 'purple' ? 'bg-purple-500' : 'bg-rose-500'
                                        }`}></div>

                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors uppercase">{cat} PYQs</h3>
                                    <p className="text-sm text-gray-500 mb-6 font-medium">Authentic Previous Year Papers</p>

                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {groupedPyqs[cat].map((item, i) => (
                                            <li key={i} className="text-gray-600 flex items-center gap-2 line-clamp-1">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent === 'orange' ? 'bg-orange-400' :
                                                        accent === 'green' ? 'bg-green-400' :
                                                            accent === 'blue' ? 'bg-blue-400' :
                                                                accent === 'purple' ? 'bg-purple-400' : 'bg-rose-400'
                                                    }`}></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => navigate('/pyqs')}
                                        className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        Explore More <ArrowRight size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PYQSection;
