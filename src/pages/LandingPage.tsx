import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTestSeries } from '../services/testSeriesService';
import type { TestSeries } from '../types/test.types';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import AISimulationSection from '../components/landing/AISimulationSection';
import TestSeriesCard from '../components/landing/TestSeriesCard';
import PYQSection from '../components/landing/PYQSection';
import TestDevDept from '../components/landing/TestDevDept';
import SocialProof from '../components/landing/SocialProof';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    const navigate = useNavigate();
    const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchTestSeries();
    }, []);

    const handleBuy = (seriesId: string) => {
        navigate(`/test-series/${seriesId}`);
    };

    return (
        <div className="font-sans antialiased bg-white text-slate-900 selection:bg-[#1D64D0] selection:text-white">
            <Navbar />

            {/* 1 & 2. Hero & Banner Section */}
            <HeroSection />

            {/* 4. AI Analysis and Real Exam Simulation Demo */}
            <AISimulationSection />

            {/* 3. Trending Test series / PYQs (Resources) */}
            <PYQSection />

            {/* Trending Series */}
            <section id="test-series" className="py-24 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold text-[#1D64D0] tracking-widest uppercase mb-2 block">Trending Products</span>
                        <h3 className="text-3xl md:text-5xl font-extrabold text-[#0B4F97]">Test Series</h3>
                        <div className="w-20 h-1.5 bg-[#1D64D0] mx-auto mt-6 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D64D0]"></div>
                            </div>
                        ) : testSeries.length > 0 ? (
                            testSeries.map((series) => (
                                <TestSeriesCard
                                    key={series.id}
                                    title={series.name}
                                    isNew={true}
                                    originalPrice={series.pricing.type === 'paid' ? `${(series.pricing.amount || 0) * 1.5}` : '0'}
                                    price={series.pricing.type === 'paid' ? `${series.pricing.amount}` : 'Free'}
                                    features={series.description ? [series.description] : []}
                                    onExplore={() => handleBuy(series.id)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-12">
                                <p>No test series available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 5. Test development Dept */}
            <TestDevDept />

            {/* 6. Social Proof & Final CTA */}
            <SocialProof />

            {/* 7. Footer */}
            <Footer />
        </div>
    );
};

export default LandingPage;
