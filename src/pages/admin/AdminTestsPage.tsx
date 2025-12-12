import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X, Save, Loader2, List } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp, arrayUnion } from 'firebase/firestore';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // index
}

interface TestSeries {
    id: string;
    title: string;
    category: string;
    price: number;
    description: string;
    questions: Question[];
    status: 'draft' | 'published';
    createdAt: any;
}

const AdminTestsPage = () => {
    const [tests, setTests] = useState<TestSeries[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Question Management State
    const [managingTest, setManagingTest] = useState<TestSeries | null>(null);
    const [questionForm, setQuestionForm] = useState({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    });

    // Form State for New Test
    const [formData, setFormData] = useState({
        title: '',
        category: 'NEET',
        price: '',
        description: '',
        status: 'draft' as const
    });

    useEffect(() => {
        const q = query(collection(db, 'testSeries'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TestSeries[];
            setTests(fetchedTests);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'testSeries'), {
                ...formData,
                price: Number(formData.price),
                questions: [],
                createdAt: serverTimestamp()
            });
            setIsCreating(false);
            setFormData({ title: '', category: 'NEET', price: '', description: '', status: 'draft' });
        } catch (error) {
            console.error("Error creating test:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this test series?')) {
            try {
                await deleteDoc(doc(db, 'testSeries', id));
            } catch (error) {
                console.error("Error deleting test:", error);
            }
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!managingTest) return;

        const newQuestion: Question = {
            id: crypto.randomUUID(),
            text: questionForm.text,
            options: questionForm.options.map(o => o.trim()), // Allow empty options if user wants, but generally should validate
            correctAnswer: Number(questionForm.correctAnswer)
        };

        try {
            const testRef = doc(db, 'testSeries', managingTest.id);
            await updateDoc(testRef, {
                questions: arrayUnion(newQuestion)
            });

            // Update local state for immediate feedback
            setManagingTest(prev => prev ? {
                ...prev,
                questions: [...(prev.questions || []), newQuestion]
            } : null);

            // Reset form
            setQuestionForm({
                text: '',
                options: ['', '', '', ''],
                correctAnswer: 0
            });
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...questionForm.options];
        newOptions[index] = value;
        setQuestionForm({ ...questionForm, options: newOptions });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const filteredTests = tests.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Tests</h1>
                    <p className="text-slate-500 mt-1">Create, edit, and publish test series.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    Create New Test
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Header/Filter Area */}
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Questions</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} /> Loading tests...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No test series found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">{test.title}</td>
                                        <td className="px-6 py-4 text-slate-500">{test.category}</td>
                                        <td className="px-6 py-4 text-slate-500">{test.questions?.length || 0}</td>
                                        <td className="px-6 py-4 font-medium text-slate-700">₹{test.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${test.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {test.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setManagingTest(test)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                    title="Manage Questions"
                                                >
                                                    <List size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsCreating(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">Create New Test Series</h2>
                                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. Full Physics Mock Test"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                                        >
                                            <option>NEET</option>
                                            <option>JEE</option>
                                            <option>SSC</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="block text-sm font-semibold text-slate-700">Pricing</label>
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="checkbox"
                                                id="isFree"
                                                checked={formData.price === '0'}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.checked ? '0' : '' })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="isFree" className="text-sm text-slate-600">This is a free test series</label>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                            <input
                                                type="number"
                                                required={formData.price !== '0'}
                                                disabled={formData.price === '0'}
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                                                placeholder={formData.price === '0' ? "Free" : "499"}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 h-24 resize-none"
                                        placeholder="Describe what's included in this test series..."
                                    ></textarea>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        <Save size={18} /> Create Test
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manage Questions Modal */}
            <AnimatePresence>
                {managingTest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setManagingTest(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Left: Questions List */}
                            <div className="w-full md:w-1/2 border-r border-slate-200 flex flex-col h-full bg-slate-50">
                                <div className="p-4 border-b border-slate-200 bg-white">
                                    <h3 className="font-bold text-slate-800">Questions ({managingTest.questions?.length || 0})</h3>
                                    <p className="text-xs text-slate-500 truncate">{managingTest.title}</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {managingTest.questions?.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400">
                                            No questions added yet.
                                        </div>
                                    ) : (
                                        managingTest.questions?.map((q, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-sm">
                                                <div className="font-medium text-slate-800 mb-2">Q{idx + 1}. {q.text}</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {q.options.map((opt, i) => (
                                                        <div key={i} className={`px-2 py-1 rounded text-xs ${i === q.correctAnswer ? 'bg-green-100 text-green-700 font-bold' : 'bg-slate-50 text-slate-500'}`}>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right: Add Question Form */}
                            <div className="w-full md:w-1/2 flex flex-col h-full bg-white">
                                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800">Add Question</h3>
                                    <button onClick={() => setManagingTest(null)} className="text-slate-400 hover:text-slate-600">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleAddQuestion} className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Question Text</label>
                                        <textarea
                                            required
                                            value={questionForm.text}
                                            onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 h-24 resize-none"
                                            placeholder="Enter question here..."
                                        ></textarea>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-slate-700">Options</label>
                                        {[0, 1, 2, 3].map((optIndex) => (
                                            <div key={optIndex} className="flex gap-2 items-center">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${questionForm.correctAnswer === optIndex ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {String.fromCharCode(65 + optIndex)}
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={questionForm.options[optIndex]}
                                                    onChange={e => handleOptionChange(optIndex, e.target.value)}
                                                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none text-sm ${questionForm.correctAnswer === optIndex ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200 focus:border-blue-500'}`}
                                                    placeholder={`Option ${optIndex + 1}`}
                                                />
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={questionForm.correctAnswer === optIndex}
                                                    onChange={() => setQuestionForm({ ...questionForm, correctAnswer: optIndex })}
                                                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                        >
                                            <Plus size={18} /> Add Question
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminTestsPage;
