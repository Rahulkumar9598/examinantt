import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Link as LinkIcon } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const AdminAddPYQPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth() || {};
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questions, setQuestions] = useState([
        { text: '', options: ['', '', '', ''], correctOption: 0 }
    ]);

    const [formData, setFormData] = useState<{
        title: string;
        category: string;
        year: string;
        type: 'pdf' | 'test';
        fileUrl: string;
        testId: string;
        price: string;
    }>({
        title: '',
        category: 'NEET',
        year: new Date().getFullYear().toString(),
        type: 'pdf',
        fileUrl: '',
        testId: '',
        price: '0'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let finalTestId = '';

            if (formData.type === 'test') {
                // Validate questions
                if (questions.length === 0) {
                    throw new Error("Please add at least one question.");
                }
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    if (!q.text.trim()) throw new Error(`Question ${i + 1} text is empty.`);
                    if (q.options.some(opt => !opt.trim())) throw new Error(`Question ${i + 1} has empty options.`);
                }

                // 1. Save all questions to 'questions' collection
                const qIds = await Promise.all(questions.map(async (q) => {
                    const qDoc = await addDoc(collection(db, 'questions'), {
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.options[q.correctOption], // Store the actual text of correct option or index, depending on standard. Let's store index as string or text. Assuming tests use text.
                        correctOptionIndex: q.correctOption,
                        type: 'MCQ',
                        subject: formData.category,
                        createdAt: serverTimestamp()
                    });
                    return qDoc.id;
                }));

                // 2. Create the test document
                const testDoc = await addDoc(collection(db, 'tests'), {
                    name: formData.title,
                    testType: 'practice',
                    questionIds: qIds,
                    settings: {
                        duration: questions.length * 2, // 2 mins per question default
                        marksPerQuestion: 4,
                        negativeMarking: -1,
                        showSolutions: true
                    },
                    status: 'published',
                    createdAt: serverTimestamp(),
                    createdBy: currentUser?.uid || 'admin'
                });
                finalTestId = testDoc.id;
            }

            const pyqData: any = {
                title: formData.title,
                category: formData.category,
                year: formData.year,
                type: formData.type,
                price: Number(formData.price),
                createdBy: currentUser?.uid || 'admin',
                createdAt: serverTimestamp()
            };

            if (formData.type === 'pdf') {
                pyqData.fileUrl = formData.fileUrl;
            } else {
                pyqData.testId = finalTestId;
            }

            await addDoc(collection(db, 'pyqs'), pyqData);
            alert('PYQ Created Successfully!');
            navigate('/admin-dashboard/pyqs');
        } catch (error: any) {
            console.error("Error creating PYQ:", error);
            alert("Failed to create PYQ: " + (error.message || 'Unknown error'));
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
                onClick={() => navigate('/admin-dashboard/pyqs')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> Back to PYQs
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-2xl font-bold text-slate-800">Add New PYQ</h1>
                    <p className="text-slate-500 mt-1">Create a new Previous Year Question resource.</p>
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
                            placeholder="e.g. JEE Mains 2023 Shift 1 Analysis"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <div className="relative">
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none"
                                >
                                    <option>NEET</option>
                                    <option>JEE</option>
                                    <option>SSC</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Year</label>
                            <input
                                type="number"
                                required
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Resource Type</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'pdf' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    checked={formData.type === 'pdf'}
                                    onChange={() => setFormData({ ...formData, type: 'pdf' })}
                                    className="hidden"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === 'pdf' ? 'border-teal-600' : 'border-slate-300'}`}>
                                    {formData.type === 'pdf' && <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" />}
                                </div>
                                <span className={`font-bold ${formData.type === 'pdf' ? 'text-teal-700' : 'text-slate-600'}`}>PDF Document</span>
                            </label>
                            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'test' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    checked={formData.type === 'test'}
                                    onChange={() => setFormData({ ...formData, type: 'test' })}
                                    className="hidden"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === 'test' ? 'border-purple-600' : 'border-slate-300'}`}>
                                    {formData.type === 'test' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
                                </div>
                                <span className={`font-bold ${formData.type === 'test' ? 'text-purple-700' : 'text-slate-600'}`}>Interactive Test</span>
                            </label>
                        </div>
                    </div>

                    {formData.type === 'pdf' ? (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <label className="block text-sm font-bold text-slate-700 mb-2">File URL / Link</label>
                            <div className="relative">
                                <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="url"
                                    required
                                    value={formData.fileUrl}
                                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    placeholder="https://firebasestorage.googleapis.com/..."
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-slate-700">Questions ({questions.length})</label>
                            </div>
                            
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative">
                                    <button 
                                        type="button" 
                                        onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}
                                        className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    >
                                        Remove
                                    </button>
                                    
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Question {qIndex + 1}</label>
                                        <textarea
                                            required
                                            value={q.text}
                                            onChange={e => {
                                                const newQ = [...questions];
                                                newQ[qIndex].text = e.target.value;
                                                setQuestions(newQ);
                                            }}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium min-h-[100px]"
                                            placeholder="Enter question text here..."
                                        />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Options (Select correct one)</label>
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correctOption === optIndex}
                                                    onChange={() => {
                                                        const newQ = [...questions];
                                                        newQ[qIndex].correctOption = optIndex;
                                                        setQuestions(newQ);
                                                    }}
                                                    className="w-5 h-5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    required
                                                    value={opt}
                                                    onChange={e => {
                                                        const newQ = [...questions];
                                                        newQ[qIndex].options[optIndex] = e.target.value;
                                                        setQuestions(newQ);
                                                    }}
                                                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${q.correctOption === optIndex ? 'border-purple-300 bg-purple-50/30' : 'border-slate-200 bg-white'}`}
                                                    placeholder={`Option ${optIndex + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            <button
                                type="button"
                                onClick={() => setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOption: 0 }])}
                                className="w-full py-4 border-2 border-dashed border-purple-200 text-purple-600 font-bold rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-colors flex items-center justify-center gap-2"
                            >
                                + Add Another Question
                            </button>
                        </motion.div>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Pricing</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.price === '0'}
                                    onChange={e => setFormData({ ...formData, price: e.target.checked ? '0' : '' })}
                                    className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                />
                                <span className="font-medium text-slate-700">Free Resource</span>
                            </label>
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                <input
                                    type="number"
                                    disabled={formData.price === '0'}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold"
                                    placeholder="Price"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-teal-600 text-white font-bold text-lg rounded-xl hover:bg-teal-700 shadow-xl shadow-teal-500/20 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {isSubmitting ? 'Creating...' : 'Create PYQ Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default AdminAddPYQPage;
