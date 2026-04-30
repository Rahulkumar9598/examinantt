// import { MousePointer2, Clock, FileText, BarChart3, PieChart as PieChartIcon, AlertCircle, CheckCircle } from 'lucide-react';

// const AISimulationSection = () => {
//     return (
//         <section className="py-12 bg-white overflow-hidden">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//                 {/* AI Performance Analysis - Refined Open Layout */}
//                 <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 lg:mb-40">

//                     {/* Left: Copy */}
//                     <div className="order-2 lg:order-1 text-center lg:text-left">
//                         <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black text-[#1D64D0] uppercase tracking-[0.25em] mb-6 lg:mb-8">
//                             <BarChart3 size={14} />
//                             Precision Analytics
//                         </div>
//                         <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0B4F97] leading-[1.1] mb-6 lg:mb-8 tracking-tighter px-2 lg:px-0">
//                             AI That Doesn't Just <br className="hidden sm:block" />
//                             Check Answers — <br className="hidden sm:block" />
//                             <span className="text-[#1D64D0]">It Improves Scores.</span>
//                         </h2>
//                         <p className="text-lg lg:text-xl text-slate-500 mb-10 lg:mb-12 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
//                             Our proprietary AI deep-dives into your performance metrics to isolate concept gaps, time pressure bottlenecks, and OMR risks.
//                         </p>

//                         <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 mb-10 lg:mb-12 text-left">
//                             {[
//                                 { title: "Mistake Audit", desc: "Identify repeated patterns automatically" },
//                                 { title: "Speed Balance", desc: "Track accuracy vs velocity ratio" },
//                                 { title: "OMR Risk Detection", desc: "Avoid bubbles errors early" },
//                                 { title: "Revision Path", desc: "Clear direction on what's next" }
//                             ].map((item, i) => (
//                                 <div key={i} className="group">
//                                     <div className="text-sm font-black text-[#0B4F97] mb-1 lg:mb-2 flex items-center gap-2">
//                                         <div className="w-1.5 h-1.5 rounded-full bg-[#1D64D0]"></div>
//                                         {item.title}
//                                     </div>
//                                     <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-wider">{item.desc}</p>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="flex flex-col sm:flex-row flex-wrap gap-4 lg:gap-5 justify-center lg:justify-start">
//                             <button className="px-8 lg:px-10 py-4 bg-[#1D64D0] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 w-full sm:w-auto">
//                                 Explore Analytics
//                             </button>
//                             <button className="px-8 lg:px-10 py-4 bg-white text-[#1D64D0] border-2 border-[#1D64D0] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 w-full sm:w-auto">
//                                 View Sample Report
//                             </button>
//                         </div>
//                     </div>

//                     {/* Right: Dashboard Visual */}
//                     <div className="order-1 lg:order-2 relative px-4 lg:px-0">
//                         {/* Decorative Background Glows */}
//                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] lg:w-[120%] h-[110%] lg:h-[120%] bg-blue-100/40 rounded-full blur-[80px] lg:blur-[120px] -z-10"></div>

//                         <div className="bg-white rounded-[32px] lg:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(11,79,151,0.15)] border border-slate-100 p-6 lg:p-12 relative z-10 transition-transform hover:-translate-y-2 duration-500">
//                             <div className="flex items-center justify-between mb-8 lg:mb-12">
//                                 <h3 className="text-xl lg:text-2xl font-black text-[#0B4F97] tracking-tighter">Performance Audit</h3>
//                                 <div className="flex gap-2">
//                                     <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-slate-100"></div>
//                                     <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-slate-100"></div>
//                                 </div>
//                             </div>

//                             <div className="space-y-8 lg:space-y-10">
//                                 <div className="bg-slate-50 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-slate-100/50">
//                                     <div className="flex items-end justify-between mb-4">
//                                         <p className="text-[10px] lg:text-sm font-bold text-slate-400 uppercase tracking-widest">Composite Score</p>
//                                         <p className="text-2xl lg:text-3xl font-black text-[#0B4F97]">482 <span className="text-base lg:text-lg text-slate-300">/ 720</span></p>
//                                     </div>
//                                     <div className="h-3 lg:h-4 bg-white rounded-full p-1 shadow-inner border border-slate-200">
//                                         <div className="h-full bg-gradient-to-r from-blue-400 to-[#1D64D0] rounded-full shadow-lg" style={{ width: '68%' }}></div>
//                                     </div>
//                                 </div>

//                                 <div className="grid grid-cols-2 gap-6 lg:gap-10">
//                                     {[
//                                         { label: "Accuracy", val: "68%", color: "bg-blue-500" },
//                                         { label: "Time Eff.", val: "91%", color: "bg-[#0B4F97]" }
//                                     ].map((m, i) => (
//                                         <div key={i}>
//                                             <p className="text-[9px] lg:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 lg:mb-2">{m.label}</p>
//                                             <p className="text-xl lg:text-2xl font-black text-slate-800 mb-2 lg:mb-3">{m.val}</p>
//                                             <div className="h-1 lg:h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                                                 <div className={`h-full ${m.color}`} style={{ width: m.val }}></div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Floating Micro-UI */}
//                         <div className="absolute -bottom-4 -left-2 lg:-bottom-6 lg:-left-12 bg-[#0B4F97] rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-2xl text-white z-20 max-w-[160px] lg:max-w-[220px] transition-transform hover:scale-110 duration-500">
//                             <PieChartIcon size={20} className="lg:size-6 text-blue-300 mb-3 lg:mb-4" />
//                             <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 lg:mb-2">Error Breakdown</p>
//                             <p className="text-base lg:text-xl font-black leading-tight">74% Avoidable Mistakes</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Simulation Demo - Refined Clean Flow */}
//                 <div className="text-center mb-16 lg:mb-24 px-4">
//                     <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 lg:mb-8">
//                         The Workflow
//                     </div>
//                     <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0B4F97] tracking-tighter mb-6 lg:mb-8 leading-tight">
//                         Simulation That <span className="text-[#1D64D0]">Wins Exams.</span>
//                     </h2>
//                     <p className="text-lg lg:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
//                         We don't just give you questions. We give you the exact environment of JEE and NEET.
//                     </p>
//                 </div>

//                 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 relative px-4 sm:px-0">
//                     {/* Horizontal Line Decor for Desktop */}
//                     <div className="hidden lg:block absolute top-[60px] left-0 w-full h-px bg-slate-100 -z-10"></div>

//                     {[
//                         { step: "01", title: "Official Interface", desc: "Same pixels, same rules as the real day.", icon: <MousePointer2 /> },
//                         { step: "02", title: "Live Windows", desc: "Strict schedules. No pause. Full focus.", icon: <Clock /> },
//                         { step: "03", title: "Physical OMR", desc: "Practice bubbling under pressure.", icon: <FileText /> },
//                         { step: "04", title: "AI Sync", desc: "Upload. Scan. Analyze instantly.", icon: <AlertCircle /> }
//                     ].map((s, i) => (
//                         <div key={i} className="text-center group">
//                             <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-2xl lg:rounded-3xl flex items-center justify-center text-[#0B4F97] mx-auto mb-8 lg:mb-10 shadow-xl border border-slate-50 group-hover:bg-[#1D64D0] group-hover:text-white transition-all duration-300 group-hover:-translate-y-2">
//                                 {s.icon}
//                             </div>
//                             <h3 className="text-lg lg:text-xl font-black text-[#0B4F97] mb-3 lg:mb-4 tracking-tight">{s.title}</h3>
//                             <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Simulation Summary Box */}
//                 <div className="bg-[#0B4F97] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
//                     <div className="lg:grid lg:grid-cols-2 gap-12 items-center relative z-10">
//                         <div>
//                             <h3 className="text-2xl font-bold mb-4">Why This Matters</h3>
//                             <p className="text-blue-100/70 mb-8 leading-relaxed">
//                                 Many students lose 30-60 marks not due to lack of knowledge, but due to exam pressure and OMR mistakes. We fix that before D-day.
//                             </p>
//                             <div className="flex flex-wrap gap-4">
//                                 <button className="px-8 py-3 bg-[#1D64D0] text-white rounded-xl font-bold hover:bg-blue-600 transition-all">Try Demo Test (Free)</button>
//                                 <button className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold backdrop-blur-sm hover:bg-white/20 transition-all">View Sample AI Analysis</button>
//                             </div>
//                         </div>
//                         <div className="hidden lg:flex justify-end gap-12">
//                             {[
//                                 { label: "Exam-Pattern Accurate", icon: <CheckCircle /> },
//                                 { label: "Pressure Oriented Practice", icon: <CheckCircle /> },
//                                 { label: "No Guesswork Analysis", icon: <CheckCircle /> }
//                             ].map((item, i) => (
//                                 <div key={i} className="flex flex-col items-center gap-3 text-center">
//                                     <div className="w-10 h-10 rounded-full bg-blue-300/20 flex items-center justify-center text-blue-300">
//                                         {item.icon}
//                                     </div>
//                                     <p className="text-xs font-bold text-blue-100 max-w-[80px]">{item.label}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                     {/* Decorative Background */}
//                     <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
//                 </div>

//             </div>
//         </section>
//     );
// };

// export default AISimulationSection;

import {
  MousePointer2,
  Clock,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';


const AISimulationSection = () => {
  return (
    <section className="bg-white py-12 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">



        {/* SECTION 1 */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* LEFT */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-xs font-semibold text-blue-600">
              <BarChart3 size={14} /> Precision Analytics
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
              AI That Doesn't Just Check Answers —{" "}
              <span className="text-blue-600">It Improves Scores.</span>
            </h2>

            <p className="text-gray-600 text-sm sm:text-base">
              Our proprietary AI deep-dives into your performance metrics to isolate concept gaps, time pressure bottlenecks, and OMR risks.
            </p>

            {/* Feature Points */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: "Mistake Audit", desc: "Identify repeated patterns automatically" },
                { title: "Speed Balance", desc: "Track accuracy vs velocity ratio" },
                { title: "OMR Risk Detection", desc: "Avoid bubbles errors early" },
                { title: "Revision Path", desc: "Clear direction on what's next" }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                Explore Analytics
              </button>
              <button className="px-5 py-2.5 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50">
                View Sample Report
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5">

            <h3 className="font-semibold text-gray-800 text-sm">
              Performance Audit
            </h3>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Composite Score</span>
                <span className="font-semibold text-gray-800">482 / 720</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Accuracy", val: "68%" },
                { label: "Time Eff.", val: "91%" }
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[11px] text-gray-500">{item.label}</p>
                  <p className="font-semibold text-sm">{item.val}</p>
                  <div className="h-1 bg-gray-100 rounded-full mt-1">
                    <div className="h-full bg-blue-500" style={{ width: item.val }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
              <PieChartIcon size={16} className="text-blue-600" />
              <div>
                <p className="text-[10px] text-gray-500">Error Breakdown</p>
                <p className="font-semibold text-sm text-gray-800">
                  74% Avoidable Mistakes
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2 */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              The Workflow
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Simulation That <span className="text-blue-600">Wins Exams.</span>
            </h2>
            <p className="text-gray-600 text-sm max-w-xl mx-auto">
              We don't just give you questions. We give you the exact environment of JEE and NEET.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Official Interface", desc: "Same pixels, same rules as the real day.", icon: <MousePointer2 size={18} /> },
              { title: "Live Windows", desc: "Strict schedules. No pause. Full focus.", icon: <Clock size={18} /> },
              { title: "Physical OMR", desc: "Practice bubbling under pressure.", icon: <FileText size={18} /> },
              { title: "AI Sync", desc: "Upload. Scan. Analyze instantly.", icon: <AlertCircle size={18} /> }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-sm transition">
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center bg-white rounded-md text-blue-600 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3 */}
        <div className="bg-blue-600 rounded-xl p-6 text-white grid md:grid-cols-2 gap-6 items-center">

          <div className="space-y-3">
            <h3 className="text-lg font-bold">Why This Matters</h3>
            <p className="text-blue-100 text-sm">
              Many students lose 30-60 marks not due to lack of knowledge, but due to exam pressure and OMR mistakes. We fix that before D-day.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-semibold">
                Try Demo Test (Free)
              </button>
              <button className="px-4 py-2 text-white text-sm">
                View Sample AI Analysis
              </button>
            </div>
          </div>

          <div className="flex justify-center md:justify-end gap-5">
            {[
              "Exam-Pattern Accurate",
              "Pressure Oriented Practice",
              "No Guesswork Analysis"
            ].map((text, i) => (
              <div key={i} className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={14} />
                </div>
                <p className="text-[10px]">{text}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default AISimulationSection;