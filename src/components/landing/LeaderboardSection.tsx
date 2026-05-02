import { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

type LeaderboardEntry = {
  id: string;
  name: string;
  classLevel: '10' | '11' | '12';
  score: number; // out of 100
  exam: string;
};

// Dummy pool for now, but UI is clean and matches theme
const STUDENTS_POOL: LeaderboardEntry[] = [
  { id: 's1', name: 'Aarav Sharma', classLevel: '10', score: 96, exam: 'School' },
  { id: 's2', name: 'Isha Patel', classLevel: '10', score: 92, exam: 'School' },
  { id: 's3', name: 'Rohit Gupta', classLevel: '11', score: 94, exam: 'JEE/NEET' },
  { id: 's4', name: 'Ananya Verma', classLevel: '11', score: 91, exam: 'JEE/NEET' },
  { id: 's5', name: 'Kabir Singh', classLevel: '12', score: 97, exam: 'JEE' },
  { id: 's6', name: 'Meera Reddy', classLevel: '12', score: 93, exam: 'NEET' },
  { id: 's7', name: 'Riya Das', classLevel: '11', score: 89, exam: 'JEE' },
  { id: 's8', name: 'Arjun Mehra', classLevel: '12', score: 90, exam: 'Commerce' },
];


export default function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');

  useEffect(() => {
    // Simulate fetching different data for different tabs
    const getScrambledData = () => {
      const basePool = [...STUDENTS_POOL];
      // Slightly modify scores based on tab to show change
      const modified = basePool.map(s => ({
        ...s,
        score: Math.min(100, s.score + (activeTab === 'monthly' ? -2 : activeTab === 'all-time' ? 1 : 0))
      }));
      return modified.sort((a, b) => b.score - a.score).slice(0, 5);
    };

    setEntries(getScrambledData());
  }, [activeTab]);


  return (
    <section className="py-24 bg-transparent relative">
      {/* Clean, Professional Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16 border-b border-slate-100 pb-12">
          <div className="max-w-2xl text-left">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Leader<span className="text-[#0D9488]">board</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              The highest performers across all categories this week.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['weekly', 'monthly', 'all-time'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab
                    ? 'bg-white text-[#0D9488] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Top 5 - Modern Institutional Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {entries.map((student, index) => {
            const isRank1 = index === 0;
            return (
              <motion.div
                key={student.id + activeTab} // Re-animate on tab change
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 transition-all duration-300 group"
              >
                {/* Rank Header */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-black w-8 h-8 rounded-full flex items-center justify-center bg-[#0D9488] text-white">
                    {index + 1}
                  </span>
                  {isRank1 && <Trophy size={18} className="text-teal-500" />}
                </div>

                {/* Profile Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mb-4 border-4 border-teal-50 bg-teal-600 text-white">
                    {student.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 truncate w-full text-center">{student.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-wider">Class {student.classLevel}</p>
                </div>

                {/* Stats Section */}
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Accuracy</span>
                    <span className="text-xl font-black text-slate-900">{student.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${student.score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full bg-teal-600"
                    />
                  </div>
                </div>

                {/* Exam Label */}
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-[9px] font-black text-[#0D9488] uppercase">
                    {student.exam}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Stats Footer - Refined for Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto py-16 border-y border-slate-100 mb-16">
          {[
            { label: 'Total Aspirants', value: '12,500+', color: 'text-slate-900' },
            { label: 'Avg. Accuracy', value: '74.2%', color: 'text-slate-900' },
            { label: 'Tests Conducted', value: '85K+', color: 'text-slate-900' },
            { label: 'Active Today', value: '1,200+', color: 'text-[#0D9488]' },
          ].map((stat, i) => (
            <div key={i} className="text-center sm:text-left">
              <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>


        {/* Live Standings Compact List */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-[32px] overflow-hidden">
            <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next in Line</span>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live Standings
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {STUDENTS_POOL.slice(5, 8).map((student, idx) => (
                <div key={student.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-default group">
                  <div className="flex items-center gap-5">
                    <span className="text-sm font-black text-slate-300 w-6 group-hover:text-teal-500 transition-colors">#{idx + 6}</span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 group-hover:text-teal-600 transition-colors text-sm">{student.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Class {student.classLevel} • {student.exam}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">{student.score}%</div>
                    </div>
                    <Medal size={20} className="text-slate-200 group-hover:text-teal-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
