import { motion } from 'framer-motion';
import { Save, User, Lock, Bell } from 'lucide-react';

const AdminSettingsPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage platform configuration and preferences.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <div className="space-y-6">
                {/* Profile Settings */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-500" /> Profile Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Display Name</label>
                            <input type="text" defaultValue="Admin User" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Email Address</label>
                            <input type="email" defaultValue="admin@examinantt.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50" readOnly />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Bell size={20} className="text-orange-500" /> Notifications
                    </h3>
                    <div className="space-y-3">
                        {['Email me when a new student registers', 'Email me when a test is purchased', 'Weekly performance summary'].map((label, i) => (
                            <label key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                                <span className="text-slate-700 font-medium">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Password & Security */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-purple-500" /> Security
                    </h3>
                    <div className="space-y-4 max-w-md">
                        <button className="text-blue-600 font-semibold hover:underline">Change Password</button>
                        <div className="pt-2">
                            <label className="flex items-center gap-3">
                                <span className="text-slate-700 font-medium">Two-Factor Authentication</span>
                                <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminSettingsPage;
