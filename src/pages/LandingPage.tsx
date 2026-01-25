import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTestSeries } from '../services/testSeriesService';
import type { TestSeries } from '../types/test.types';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeatureSliderLike from '../components/landing/FeatureSliderLike';
import TestSeriesCard from '../components/landing/TestSeriesCard';
import PYQSection from '../components/landing/PYQSection';
import Footer from '../components/landing/Footer';
// test
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
        // Navigate to details page for everyone (guest or logged in)
        navigate(`/test-series/${seriesId}`);
    };

    return (
        <div className="font-sans antialiased bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
            <Navbar />
            <HeroSection />

            {/* Slider / Key Features Section */}
            <FeatureSliderLike />

            {/* Trending Series */}
            <section id="test-series" className="py-20 bg-blue-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-bold text-green-600 tracking-widest uppercase mb-2">Exam Categories</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">Choose Your Exam</h3>
                        <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : testSeries.length > 0 ? (
                            testSeries.map((series) => (
                                <TestSeriesCard
                                    key={series.id}
                                    title={series.name}
                                    isNew={true} // You might want to derive this from createdAt
                                    originalPrice={series.pricing.type === 'paid' ? `${(series.pricing.amount || 0) * 1.5}` : '0'}
                                    price={series.pricing.type === 'paid' ? `${series.pricing.amount}` : 'Free'}
                                    features={series.description ? [series.description] : []}
                                    colorTheme={series.examCategory === 'NEET' ? 'green' : 'blue'}
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

            {/* Explore PYQs */}
            <PYQSection />

            {/* Footer */}
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default LandingPage;
