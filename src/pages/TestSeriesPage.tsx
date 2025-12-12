import PageLayout from '../components/landing/PageLayout';
import TestSeriesCard from '../components/landing/TestSeriesCard';

const TestSeriesPage = () => {
    return (
        <PageLayout>
            <div className="bg-blue-50/30 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">All Test Series</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Comprehensive test series designed by experts to help you ace your JEE, NEET, and SSC exams.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TestSeriesCard
                            title="JEE Mains 2025"
                            isNew={true}
                            originalPrice="1999"
                            price="999"
                            features={[
                                "Full Length Mocks",
                                "Chapterwise Tests",
                                "Detailed Analytics",
                                "Real Exam Interface"
                            ]}
                        />
                        <TestSeriesCard
                            title="NEET UG 2025"
                            isNew={true}
                            originalPrice="1999"
                            price="999"
                            features={[
                                "NCERT Based",
                                "PCB Full Syllabus",
                                "Performance Tracking",
                                "Video Solutions"
                            ]}
                        />
                        <TestSeriesCard
                            title="SSC CGL Tier I & II"
                            isNew={true}
                            originalPrice="1499"
                            price="699"
                            features={[
                                "Latest Pattern",
                                "Speed Improvement",
                                "GK/GS Focus",
                                "All India Rank"
                            ]}
                        />
                        <TestSeriesCard
                            title="JEE Advanced Elite"
                            isNew={false}
                            originalPrice="2999"
                            price="1499"
                            features={[
                                "High difficulty problems",
                                "Detailed video solutions",
                                "All India Rank prediction",
                                "Doubt clearing support"
                            ]}
                        />
                        <TestSeriesCard
                            title="SSC CHSL & MTS"
                            isNew={false}
                            originalPrice="999"
                            price="499"
                            features={[
                                "Previous Year Papers",
                                "Topic-wise Quizzes",
                                "Mock Tests",
                                "Bilingual Content"
                            ]}
                        />
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default TestSeriesPage;
