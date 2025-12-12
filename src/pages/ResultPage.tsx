import PageLayout from '../components/landing/PageLayout';
import { Search } from 'lucide-react';

const ResultPage = () => {
    return (
        <PageLayout>
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full px-6">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Results</h1>
                        <p className="text-gray-500 mb-8">Enter your Roll Number and Date of Birth to view your test results.</p>

                        <form className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Roll Number (e.g. 210543)"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-500"
                                />
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/30">
                                View Result
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ResultPage;
