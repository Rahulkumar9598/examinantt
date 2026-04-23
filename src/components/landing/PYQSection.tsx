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

    return (
        <section id="resources" className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#F0F6FF] text-[#1D64D0] text-sm font-bold uppercase tracking-wide mb-4 border border-blue-100">Resources</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B4F97] mb-4 tracking-tighter">Explore PYQs (Free)</h2>
                    <p className="text-[#1D64D0] font-black text-base sm:text-lg uppercase tracking-widest opacity-60">
                        Access previous year questions
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[#1D64D0]" size={40} />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 italic bg-[#F0F6FF] rounded-3xl border-2 border-dashed border-blue-100 mx-4">
                        No previous year questions available yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-4 sm:px-0">
                        {categories.map((cat) => {
                            return (
                                <div key={cat} className="bg-white rounded-2xl p-6 lg:p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                                    {/* Top Border Accent */}
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1D64D0]"></div>

                                    <h3 className="text-xl lg:text-2xl font-black text-[#0B4F97] mb-2 group-hover:text-[#1D64D0] transition-colors uppercase tracking-tight">{cat} PYQs</h3>
                                    <p className="text-xs text-slate-400 mb-6 font-black uppercase tracking-widest">Authentic Papers</p>

                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {groupedPyqs[cat].map((item, i) => (
                                            <li key={i} className="text-slate-600 flex items-center gap-2 text-sm font-semibold line-clamp-1">
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#1D64D0]"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => navigate('/pyqs')}
                                        className="w-full py-4 rounded-xl border-2 border-[#1D64D0] text-[#1D64D0] font-black text-sm uppercase tracking-widest hover:bg-[#1D64D0] hover:text-white transition-all flex items-center justify-center gap-2"
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
