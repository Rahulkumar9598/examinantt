import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeatureSliderLike from '../components/landing/FeatureSliderLike';
import TestSeriesCard from '../components/landing/TestSeriesCard';
import PYQSection from '../components/landing/PYQSection';
import Footer from '../components/landing/Footer';
import logo from '../assets/logo.png';
// test
const LandingPage = () => {

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
                        <TestSeriesCard
                            title="JEE Mains & Advanced"
                            isNew={true}
                            originalPrice="2999"
                            price="1499"
                            features={[
                                "Full Length Mock Tests",
                                "Chapter-wise Practice",
                                "Previous Year Papers",
                                "All India Rank"
                            ]}
                        />
                        <TestSeriesCard
                            title="NEET UG Series"
                            isNew={true}
                            originalPrice="2499"
                            price="1299"
                            features={[
                                "NCERT Based Pattern",
                                "Physics, Chem, Bio",
                                "Detailed Solutions",
                                "Performance Analytics"
                            ]}
                        />
                        <TestSeriesCard
                            title="SSC CGL / CHSL"
                            isNew={true}
                            originalPrice="1999"
                            price="999"
                            features={[
                                "Quant, Reasoning, English",
                                "General Awareness",
                                "Speed Tests",
                                "Exam Oriented Interface"
                            ]}
                        />
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
