import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, FileText, Video, Link as LinkIcon, UploadCloud } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const AdminAddResourcePage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth() || {};
    const [isSubmitting, setIsSubmitting] = useState(false);

    // In a real app, you would handle file upload to Firebase Storage here.
    // For this MVP, we will assume PDF via URL or external hosting for simplicity, 
    // unless 'storage' service is available. We'll simulate 'Upload' or just take URL.

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        category: string;
        type: 'pdf' | 'video' | 'link';
        url: string;
        isFree: boolean;
        price: string;
    }>({
        title: '',
        description: '',
        category: 'General',
        type: 'pdf',
        url: '',
        isFree: true,
        price: '0'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'resources'), {
                ...formData,
                price: formData.isFree ? 0 : Number(formData.price),
                createdBy: currentUser?.uid || 'admin',
                createdAt: serverTimestamp()
            });
            alert('Resource Added Successfully!');
            navigate('/admin-dashboard/resources');
        } catch (error: any) {
            console.error("Error adding resource:", error);
            alert("Failed to add resource: " + (error.message || 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <button
                onClick={() => navigate('/admin-dashboard/resources')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Resources
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-2xl font-bold text-slate-800">Add New Resource</h1>
                    <p className="text-slate-500 mt-1">Upload study notes, PDFs, or add video links.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                            placeholder="e.g. Physics Formula Sheet"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        >
                            <option>General</option>
                            <option>Physics</option>
                            <option>Chemistry</option>
                            <option>Mathematics</option>
                            <option>Biology</option>
                        </select>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Resource Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { id: 'pdf', label: 'PDF / Notes', icon: FileText, color: 'blue' },
                                { id: 'video', label: 'Video', icon: Video, color: 'red' },
                                { id: 'link', label: 'External Link', icon: LinkIcon, color: 'emerald' }
                            ].map(type => (
                                <label key={type.id} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.type === type.id ? `border-${type.color}-500 bg-${type.color}-50` : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={formData.type === type.id}
                                        onChange={() => setFormData({ ...formData, type: type.id as any })}
                                        className="hidden"
                                    />
                                    <type.icon size={24} className={formData.type === type.id ? `text-${type.color}-600` : 'text-slate-400'} />
                                    <span className={`text-sm font-bold ${formData.type === type.id ? `text-${type.color}-700` : 'text-slate-600'}`}>{type.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {formData.type === 'pdf' ? 'File URL / PDF Link' : formData.type === 'video' ? 'Video URL (YouTube)' : 'Website URL'}
                        </label>
                        <div className="relative">
                            <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="url"
                                required
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono text-sm"
                                placeholder="https://..."
                            />
                        </div>
                        {formData.type === 'pdf' && (
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <UploadCloud size={14} />
                                For manual file uploads, use Firebase Storage console and paste link here.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 h-24 resize-none"
                            placeholder="Brief details about this resource..."
                        />
                    </div>

                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Pricing</label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFree}
                                    onChange={e => setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? '0' : formData.price })}
                                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                />
                                <div>
                                    <span className="block font-bold text-slate-700">Free Resource</span>
                                    <span className="text-xs text-slate-500">Accessible to everyone</span>
                                </div>
                            </label>

                            {!formData.isFree && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex-1 relative"
                                >
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-bold text-slate-900"
                                        placeholder="Enter Price"
                                    />
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-teal-600 text-white font-bold text-lg rounded-xl hover:bg-teal-700 shadow-xl shadow-teal-500/20 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {isSubmitting ? 'Saving...' : 'Add Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default AdminAddResourcePage;
