import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X, Save, Loader2, FolderPlus, BookOpen, Edit2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

interface Topic {
    id: string;
    name: string;
    subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'All';
    unit?: string; // Unit name/number (e.g., "Unit 1", "Mechanics")
    description: string;
    chapters: string[]; // Related chapters
    difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
    tags?: string[];
    status: 'draft' | 'active' | 'archived';
    createdAt: any;
    updatedAt?: any;
}

const AdminTopicsPage = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState<string>('all');

    const [formData, setFormData] = useState({
        name: '',
        subject: 'Physics' as 'Physics' | 'Chemistry' | 'Mathematics' | 'All',
        unit: '',
        description: '',
        chapters: [''],
        difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard' | 'Mixed',
        tags: [] as string[],
        status: 'active' as 'draft' | 'active' | 'archived'
    });

    useEffect(() => {
        const q = query(collection(db, 'topics'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTopics = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Topic[];
            setTopics(fetchedTopics);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'topics'), {
                ...formData,
                unit: formData.unit.trim() || undefined,
                chapters: formData.chapters.filter(c => c.trim() !== ''),
                tags: formData.tags.filter(t => t.trim() !== ''),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            setIsCreating(false);
            setFormData({
                name: '',
                subject: 'Physics',
                unit: '',
                description: '',
                chapters: [''],
                difficulty: 'Medium',
                tags: [],
                status: 'active'
            });
        } catch (error) {
            console.error("Error creating topic:", error);
            alert("Error creating topic. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this topic?')) {
            try {
                await deleteDoc(doc(db, 'topics', id));
            } catch (error) {
                console.error("Error deleting topic:", error);
                alert("Error deleting topic. Please try again.");
            }
        }
    };

    const handleEdit = (topic: Topic) => {
        setEditingTopic(topic);
        setFormData({
            name: topic.name,
            subject: topic.subject,
            unit: topic.unit || '',
            description: topic.description,
            chapters: topic.chapters.length > 0 ? topic.chapters : [''],
            difficulty: topic.difficulty || 'Medium',
            tags: topic.tags || [],
            status: topic.status
        });
        setIsEditing(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTopic) return;

        try {
            const topicRef = doc(db, 'topics', editingTopic.id);
            await updateDoc(topicRef, {
                name: formData.name,
                subject: formData.subject,
                unit: formData.unit.trim() || undefined,
                description: formData.description,
                chapters: formData.chapters.filter(c => c.trim() !== ''),
                difficulty: formData.difficulty,
                tags: formData.tags.filter(t => t.trim() !== ''),
                status: formData.status,
                updatedAt: serverTimestamp()
            });

            setIsEditing(false);
            setEditingTopic(null);
            setFormData({
                name: '',
                subject: 'Physics',
                unit: '',
                description: '',
                chapters: [''],
                difficulty: 'Medium',
                tags: [],
                status: 'active'
            });
        } catch (error) {
            console.error("Error updating topic:", error);
            alert("Error updating topic. Please try again.");
        }
    };

    const handleChapterChange = (index: number, value: string) => {
        const newChapters = [...formData.chapters];
        newChapters[index] = value;
        setFormData({ ...formData, chapters: newChapters });
    };

    const addChapterField = () => {
        setFormData({ ...formData, chapters: [...formData.chapters, ''] });
    };

    const removeChapterField = (index: number) => {
        const newChapters = formData.chapters.filter((_, i) => i !== index);
        setFormData({ ...formData, chapters: newChapters });
    };

    const filteredTopics = topics.filter(topic => {
        const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = filterSubject === 'all' || topic.subject === filterSubject;
        return matchesSearch && matchesSubject;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Topics</h1>
                    <p className="text-slate-500 mt-1">Create and organize topics for test creation</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    Create Topic
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">{topics.length}</div>
                    <div className="text-sm text-slate-600 mt-1">Total Topics</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600">
                        {topics.filter(t => t.subject === 'Physics').length}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Physics</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600">
                        {topics.filter(t => t.subject === 'Chemistry').length}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Chemistry</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600">
                        {topics.filter(t => t.subject === 'Mathematics').length}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Mathematics</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                        <option value="all">All Subjects</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                    </select>
                </div>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <FolderPlus className="mx-auto text-slate-300 mb-4" size={64} />
                        <h3 className="text-lg font-bold text-slate-600 mb-2">No topics found</h3>
                        <p className="text-slate-500 mb-6">Create your first topic to organize questions</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={20} />
                            Create Topic
                        </button>
                    </div>
                ) : (
                    filteredTopics.map((topic) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="text-blue-600" size={24} />
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{topic.name}</h3>
                                        {topic.unit && (
                                            <p className="text-xs text-slate-500 mt-0.5">{topic.unit}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(topic)}
                                        className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg"
                                        title="Edit topic"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(topic.id)}
                                        className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                                        title="Delete topic"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{topic.description || 'No description provided'}</p>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${topic.subject === 'Physics' ? 'bg-green-100 text-green-700' :
                                    topic.subject === 'Chemistry' ? 'bg-purple-100 text-purple-700' :
                                        topic.subject === 'Mathematics' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {topic.subject}
                                </span>

                                {topic.difficulty && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${topic.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                                        topic.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                            topic.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                                                'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {topic.difficulty}
                                    </span>
                                )}

                                {topic.status && topic.status !== 'active' && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${topic.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                        'bg-slate-100 text-slate-700'
                                        }`}>
                                        {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                                    </span>
                                )}
                            </div>

                            {topic.chapters.length > 0 && (
                                <div className="border-t border-slate-100 pt-3">
                                    <p className="text-xs text-slate-500 mb-2">Chapters ({topic.chapters.length})</p>
                                    <div className="flex flex-wrap gap-1">
                                        {topic.chapters.slice(0, 3).map((chapter, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                                            >
                                                {chapter}
                                            </span>
                                        ))}
                                        {topic.chapters.length > 3 && (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                                                +{topic.chapters.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-slate-800">Create New Topic</h2>
                                <button onClick={() => setIsCreating(false)}>
                                    <X size={24} className="text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-6 space-y-5">
                                {/* Topic Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Topic Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Electromagnetic Induction"
                                    />
                                </div>

                                {/* Subject and Unit */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Subject *
                                        </label>
                                        <select
                                            required
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value as any })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="Physics">Physics</option>
                                            <option value="Chemistry">Chemistry</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="All">All Subjects</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Unit
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Unit 1, Mechanics"
                                        />
                                    </div>
                                </div>

                                {/* Difficulty and Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Difficulty Level
                                        </label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                            <option value="Mixed">Mixed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="draft">Draft</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                                        placeholder="Brief description of this topic..."
                                    />
                                </div>

                                {/* Related Chapters */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Related Chapters
                                    </label>
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                        {formData.chapters.map((chapter, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="flex-1 flex gap-2 items-center">
                                                    <span className="text-sm font-medium text-slate-500 w-20">
                                                        Chapter {idx + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={chapter}
                                                        onChange={e => handleChapterChange(idx, e.target.value)}
                                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder={`Enter chapter ${idx + 1} name`}
                                                    />
                                                </div>
                                                {formData.chapters.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChapterField(idx)}
                                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove chapter"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addChapterField}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        Add Another Chapter
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Create Topic
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-slate-800">Edit Topic</h2>
                                <button onClick={() => {
                                    setIsEditing(false);
                                    setEditingTopic(null);
                                }}>
                                    <X size={24} className="text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-6 space-y-5">
                                {/* Same form fields as create modal */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Topic Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Electromagnetic Induction"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Subject *
                                        </label>
                                        <select
                                            required
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value as any })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="Physics">Physics</option>
                                            <option value="Chemistry">Chemistry</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="All">All Subjects</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Unit
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Unit 1, Mechanics"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Difficulty Level
                                        </label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                            <option value="Mixed">Mixed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option value="active">Active</option>
                                            <option value="draft">Draft</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                                        placeholder="Brief description of this topic..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Related Chapters
                                    </label>
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                        {formData.chapters.map((chapter, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="flex-1 flex gap-2 items-center">
                                                    <span className="text-sm font-medium text-slate-500 w-20">
                                                        Chapter {idx + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={chapter}
                                                        onChange={e => handleChapterChange(idx, e.target.value)}
                                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder={`Enter chapter ${idx + 1} name`}
                                                    />
                                                </div>
                                                {formData.chapters.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChapterField(idx)}
                                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove chapter"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addChapterField}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        Add Another Chapter
                                    </button>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Update Topic
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminTopicsPage;
