import { useState, useEffect } from 'react';
import PageLayout from '../components/landing/PageLayout';
import TestSeriesCard from '../components/landing/TestSeriesCard';
import { getAllTestSeries } from '../services/testSeriesService';
import { Loader2, Zap, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { TestSeries } from '../types/test.types';
import { subjectService } from '../services/subjectService';
import { classService } from '../services/classService';

const TestSeriesPage = () => {
    const [series, setSeries] = useState<TestSeries[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [seriesData, classesData, subjectsData] = await Promise.all([
                    getAllTestSeries({ status: 'published' }),
                    classService.getAll(),
                    subjectService.getAll()
                ]);
                setSeries(seriesData);
                setAvailableClasses(classesData.map(c => c.name));
                setAvailableSubjects(subjectsData.map(s => s.name));
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExplore = (item: TestSeries) => {
        navigate(`/test-series/${item.id}`);
    };

    const normalizeText = (value: unknown) => String(value ?? '').trim().toLowerCase();

    const getCourseClass = (item: TestSeries) => (item as any).courseClass || (item as any).className || '';
    const getSubject = (item: TestSeries) => (item as any).subject || (item as any).subjectName || '';

    // Filter Logic
    const filteredSeries = series.filter((item) => {
        // If nothing is selected, we want to include it (so we can slice to 9 later)
        if (!selectedClass && !selectedSubject) return true;
        
        const matchesClass = !selectedClass || getCourseClass(item) === selectedClass;
        const matchesSubject = !selectedSubject || normalizeText(getSubject(item)) === normalizeText(selectedSubject);
        
        return matchesClass && matchesSubject;
    });

    // Display Logic: Show 9 by default, or all if filtered
    const displaySeries = (!selectedClass && !selectedSubject) 
        ? filteredSeries.slice(0, 9) 
        : filteredSeries;

    const isFiltering = !!selectedClass || !!selectedSubject;

    return (
        <PageLayout>
            <div className="bg-[#f8fafc] py-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="text-center mb-20">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-black uppercase tracking-widest mb-6"
                        >
                            < Zap size={14} fill="currentColor" />
                            Premium Test Series
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            Ace Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">Future.</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            Expert-crafted test series for JEE, NEET, and Board Exams. Select your category to begin your journey to success.
                        </p>
                    </div>

                    {/* Interactive Chip Filters */}
                    {!isLoading && series.length > 0 && (
                        <div className="space-y-10 mb-20">
                            {/* Class Selection */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Step 1: Select Your Class</span>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            setSelectedClass('');
                                            setSelectedSubject('');
                                        }}
                                        className={`
                                            px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300
                                            ${!selectedClass 
                                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' 
                                                : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-600'}
                                        `}
                                    >
                                        All Classes
                                    </button>
                                    {availableClasses.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => {
                                                setSelectedClass(c);
                                                setSelectedSubject('');
                                            }}
                                            className={`
                                                px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300
                                                ${selectedClass === c 
                                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' 
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-600'}
                                            `}
                                        >
                                            Class {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject Selection */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: selectedClass ? 1 : 0.5, y: 0 }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Step 2: Choose Your Subject</span>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        onClick={() => setSelectedSubject('')}
                                        className={`
                                            px-6 py-3 rounded-xl font-bold text-xs transition-all duration-300
                                            ${selectedClass && !selectedSubject 
                                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                                                : 'bg-white text-slate-500 border border-slate-100 hover:border-teal-200 hover:text-teal-500'}
                                        `}
                                    >
                                        All Subjects
                                    </button>
                                    {availableSubjects.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSubject(s)}
                                            className={`
                                                px-6 py-3 rounded-xl font-bold text-xs transition-all duration-300
                                                ${selectedSubject === s 
                                                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                                                    : 'bg-white text-slate-500 border border-slate-100 hover:border-teal-200 hover:text-teal-500'}
                                            `}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Results Grid */}
                    <div className="relative">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 className="animate-spin text-teal-500 mb-4" size={48} />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Courses...</span>
                            </div>
                        ) : series.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200">
                                <div className="text-slate-300 mb-4 flex justify-center"><BookOpen size={64} /></div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">No test series available yet.</h3>
                                <p className="text-slate-500 font-medium">We're working hard to bring you the best content. Check back soon!</p>
                            </div>
                        ) : displaySeries.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No matches found.</h3>
                                <p className="text-slate-500 font-medium">Try selecting a different subject or class combination.</p>
                            </div>
                        ) : (
                            <>
                                {!isFiltering && (
                                    <div className="flex items-center justify-between px-6 mb-8">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Featured Courses (Top 9)</span>
                                        <div className="h-px flex-1 bg-slate-100 mx-8" />
                                        <div className="text-xs font-bold text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100">
                                            {series.length} Total
                                        </div>
                                    </div>
                                )}
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                                >
                                    {displaySeries.map((item) => (
                                        <TestSeriesCard
                                            key={item.id}
                                            title={item.name}
                                            isNew={item.status === 'published'}
                                            description={item.description}
                                            originalPrice={(item.pricing?.amount || 0) * 1.5}
                                            price={item.pricing?.amount || 0}
                                            examCategory={item.examCategory}
                                            testCount={item.stats?.totalTests || item.testIds?.length || 0}
                                            features={item.features || [
                                                "Updated 2024 Syllabus",
                                                "Detailed Solutions",
                                                "All India Ranking"
                                            ]}
                                            onExplore={() => handleExplore(item)}
                                        />
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default TestSeriesPage;
