import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="relative inline-block mb-8">
                    <div className="text-[150px] font-bold text-slate-200 leading-none">404</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search size={64} className="text-teal-500 drop-shadow-xl" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-4">Page Not Found</h1>
                <p className="text-slate-500 mb-8 text-lg">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all"
                    >
                        <Home size={18} />
                        Home Page
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
