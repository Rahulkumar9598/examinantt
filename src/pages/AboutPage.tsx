import PageLayout from '../components/landing/PageLayout';
import logo from '../assets/logo.png';

const AboutPage = () => {
    return (
        <PageLayout>
            <div className="bg-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <img src={logo} alt="Examinantt Logo" className="w-20 h-20 mx-auto rounded-xl mb-6 shadow-lg" />
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About Examinantt</h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            We are on a mission to democratize quality education and exam preparation through technology.
                        </p>
                    </div>

                    <div className="prose prose-lg mx-auto text-gray-600">
                        <p className="mb-6">
                            Examinantt was founded with a simple yet powerful idea: that every student deserves access to the best testing tools and analytics, regardless of their location or background.
                        </p>
                        <p className="mb-6">
                            Our platform combines state-of-the-art technology with high-quality content curated by industry experts. We simulate real exam environments to help students build confidence and improve their performance.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Our Vision</h2>
                        <p className="mb-6">
                            To become the most trusted and effective exam preparation partner for students across India, empowering them to achieve their academic goals.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
                            <div>
                                <h3 className="text-4xl font-bold text-blue-600 mb-2">10k+</h3>
                                <p className="text-gray-500">Students Trusted</p>
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-blue-600 mb-2">500+</h3>
                                <p className="text-gray-500">Tests Conducted</p>
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-blue-600 mb-2">50+</h3>
                                <p className="text-gray-500">Expert Educators</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default AboutPage;
