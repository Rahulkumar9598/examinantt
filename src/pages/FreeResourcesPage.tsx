import PageLayout from '../components/landing/PageLayout';
import { FileText, Download, PlayCircle } from 'lucide-react';

const FreeResourcesPage = () => {
    const resources = [
        {
            title: "JEE Mains Formula Sheet (Physics)",
            type: "PDF",
            size: "2.5 MB",
            icon: <FileText className="text-red-500" size={24} />
        },
        {
            title: "Chemistry Periodic Table Guide",
            type: "PDF",
            size: "1.2 MB",
            icon: <FileText className="text-blue-500" size={24} />
        },
        {
            title: "Maths - Integration Shortcuts",
            type: "Video",
            duration: "15 mins",
            icon: <PlayCircle className="text-purple-500" size={24} />
        },
        {
            title: "NEET Biology One-Shot Notes",
            type: "PDF",
            size: "5.8 MB",
            icon: <FileText className="text-green-500" size={24} />
        },
        {
            title: "SSC CGL General Awareness 2024",
            type: "PDF",
            size: "3.2 MB",
            icon: <FileText className="text-orange-500" size={24} />
        }
    ];

    return (
        <PageLayout>
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Free Resources</h1>
                        <p className="text-lg text-gray-600">
                            Download high-quality study materials, formula sheets, and watch revision videos for free.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {resources.map((resource, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                        {resource.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{resource.title}</h3>
                                        <p className="text-sm text-gray-500">{resource.type} • {resource.size || resource.duration}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default FreeResourcesPage;
