import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTestSeries } from '../services/testSeriesService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import type { TestSeries } from '../types/test.types';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import AISimulationSection from '../components/landing/AISimulationSection';
// import PYQSection from '../components/landing/PYQSection';
import TestDevDept from '../components/landing/TestDevDept';
import SocialProof from '../components/landing/SocialProof';
import LeaderboardSection from '../components/landing/LeaderboardSection';
import Footer from '../components/landing/Footer';
import TestSeriesCard from '../components/landing/TestSeriesCard';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const navigate = useNavigate();
    const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Filtering State
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [classesData, subjectsData] = await Promise.all([
                    classService.getAll(),
                    subjectService.getAll()
                ]);
                setAvailableClasses(classesData.map(c => c.name));
                setAvailableSubjects(subjectsData.map(s => s.name));
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        };

        const fetchTestSeries = async () => {
            try {
                const data = await getAllTestSeries({ status: 'published' });
                setTestSeries(data);
            } catch (error) {
                console.error("Error fetching test series:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
        fetchTestSeries();
    }, []);

    const normalizeText = (value: unknown) => String(value ?? '').trim().toLowerCase();
    const getCourseClass = (item: TestSeries) => (item as any).courseClass || (item as any).className || '';
    const getSubject = (item: TestSeries) => (item as any).subject || (item as any).subjectName || '';

    // Dynamic Filter Logic for Test Series
    const filteredSeries = testSeries.filter((item) => {
        if (!selectedClass && !selectedSubject) return true;

        const matchesClass = !selectedClass || getCourseClass(item) === selectedClass;
        const matchesSubject = !selectedSubject || normalizeText(getSubject(item)) === normalizeText(selectedSubject);

        return matchesClass && matchesSubject;
    });

    const handleBuy = (seriesId: string) => {
        navigate(`/test-series/${seriesId}`);
    };

    const scrollToTestSeries = () => {
        const el = document.getElementById('test-series');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-[#0D9488] selection:text-white relative min-h-screen">
            {/* Global Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-teal-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-emerald-50/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-50/30 blur-[120px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
            </div>

            <div className="relative z-10">
                <Navbar />

            {/* 1 & 2. Hero & Banner Section */}
            <HeroSection onGetStarted={scrollToTestSeries} />

            <LeaderboardSection />

            {/* 3. Test Series Section (Moved up) */}
            <section id="test-series" className="relative py-10 scroll-mt-24">

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* HEADER */}
                    <div className="text-center mb-10 md:mb-12">
                        <span className="inline-block text-xs font-semibold text-[#0D9488] bg-[#0D9488]/10 px-4 py-1.5 rounded-full tracking-wide mb-4">
                            Practice & Preparation
                        </span>

                        <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900">
                            Explore Our Test Series
                        </h3>

                        <p className="mt-4 text-gray-500 max-w-xl mx-auto text-sm md:text-base">
                            Practice with curated mock tests designed to boost your exam performance and confidence.
                        </p>

                        <div className="w-16 h-1 bg-gradient-to-r from-[#0D9488] to-indigo-600 mx-auto mt-6 rounded-full"></div>
                    </div>


                    {/* Premium Filter Section */}
                    <div className="relative mb-12 z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-slate-100 shadow-sm p-6 md:p-8"
                        >
                            <div className="flex flex-col lg:flex-row items-center gap-10">
                                <div className="w-full lg:w-1/3">
                                    <h4 className="text-xl font-black text-slate-900 mb-2">Find Your Course</h4>
                                    <p className="text-sm text-slate-500 font-medium">Filter by class and subject to find the perfect test series for you.</p>
                                </div>

                                <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Class</label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSelectedClass('')}
                                                className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 border ${selectedClass === ''
                                                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200 scale-105'
                                                        : 'bg-white text-slate-600 border-slate-100 hover:border-teal-200 hover:bg-teal-50'
                                                    }`}

                                            >
                                                All Classes
                                            </button>
                                            {availableClasses.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setSelectedClass(c)}
                                                    className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 border ${selectedClass === c
                                                            ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200 scale-105'
                                                            : 'bg-white text-slate-600 border-slate-100 hover:border-teal-200 hover:bg-teal-50'
                                                        }`}
                                                >
                                                    Class {c}
                                                </button>
                                                
                                            ))}
                                            {availableClasses.length === 0 && (
                                                <div className="text-slate-300 text-sm italic py-2">Loading classes...</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-64 space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Subject</label>
                                        <div className="relative group">
                                            <select
                                                value={selectedSubject}
                                                onChange={(e) => setSelectedSubject(e.target.value)}
                                                disabled={!selectedClass}
                                                className="w-full appearance-none rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm px-5 py-3.5 text-slate-800 font-bold focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm group-hover:border-teal-200"
                                            >
                                                <option value="">{selectedClass ? 'All Subjects' : 'Select class first'}</option>
                                                {availableSubjects.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-teal-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* CONTENT */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0D9488]"></div>
                        </div>
                    ) : filteredSeries.length > 0 ? (

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                            {filteredSeries.map((series, index) => (
                                <motion.div
                                    key={series.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-full"
                                >
                                    <TestSeriesCard
                                        title={series.name}
                                        description={series.description}
                                        examCategory={series.examCategory}
                                        price={series.pricing.type === 'paid' ? (series.pricing.amount ?? 0) : 'Free'}
                                        originalPrice={series.pricing.type === 'paid' ? (series.pricing.amount ?? 0) * 1.5 : 0}
                                        testCount={series.testIds?.length || 0}
                                        onExplore={() => handleBuy(series.id)}
                                        isNew={index === 0} // Just for visual flair on the first one
                                    />
                                </motion.div>
                            ))}
                        </div>

                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-slate-500 text-sm font-semibold">
                                No test series available for the selected criteria.
                            </p>
                        </div>
                    )}
                </div>
            </section>

           

            {/* AI Analysis and Real Exam Simulation Demo (Moved down) */}
            <AISimulationSection />

            {/* 5. Test development Dept */}
            <TestDevDept />

            {/* 6. Social Proof & Final CTA */}
            <SocialProof />

            {/* 7. Footer */}
            <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
