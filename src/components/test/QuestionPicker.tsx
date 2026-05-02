import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Loader2, BookOpen } from 'lucide-react';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Question {
    id: string;
    text: string;
    subject: string;
    chapter: string;
    chapterId?: string;
    type: 'MCQ' | 'Numerical';
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface ChapterInfo {
    id: string;
    name: string;
    subject: string;
}

interface QuestionPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (questionIds: string[]) => void;
    initialSelected?: string[];
    subjects: string[];
    // Optional: pre-fetched chapter IDs to filter by
    selectedChapterIds?: Record<string, string[]>; // subject -> chapterIds
    maxSelection?: number;
}

const QuestionPicker = ({
    isOpen,
    onClose,
    onSelect,
    initialSelected = [],
    subjects,
    selectedChapterIds,
    maxSelection
}: QuestionPickerProps) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [chapterMap, setChapterMap] = useState<Record<string, ChapterInfo>>({});

    // Filters
    const [activeSubject, setActiveSubject] = useState<string>(subjects[0] || '');
    const [filterChapterId, setFilterChapterId] = useState<string>('all');
    const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
    const [filterType, setFilterType] = useState<'all' | 'MCQ' | 'Numerical'>('all');

    // Available chapters for the current subject
    const availableChapters = (selectedChapterIds?.[activeSubject] || []).map(id => ({
        id,
        name: chapterMap[id]?.name || id
    }));

    useEffect(() => {
        if (isOpen) {
            fetchChapterNames();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setFilterChapterId('all');
            fetchQuestions();
        }
    }, [isOpen, activeSubject, filterDifficulty, filterType]);

    useEffect(() => {
        if (isOpen) fetchQuestions();
    }, [filterChapterId]);

    // Update active subject if props change
    useEffect(() => {
        if (subjects.length > 0 && !subjects.includes(activeSubject)) {
            setActiveSubject(subjects[0]);
        }
    }, [subjects]);

    const fetchChapterNames = async () => {
        if (!selectedChapterIds) return;
        const allIds = Object.values(selectedChapterIds).flat();
        const newMap: Record<string, ChapterInfo> = {};
        await Promise.all(allIds.map(async id => {
            if (chapterMap[id]) { newMap[id] = chapterMap[id]; return; }
            try {
                const snap = await getDoc(doc(db, 'chapters', id));
                if (snap.exists()) {
                    newMap[id] = { id, name: snap.data().name, subject: snap.data().subject };
                }
            } catch { /* ignore */ }
        }));
        setChapterMap(prev => ({ ...prev, ...newMap }));
    };

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            let constraints: any[] = [
                where('subject', '==', activeSubject),
                limit(300)
            ];

            // Filter by specific chapter if selected
            if (filterChapterId !== 'all') {
                // Try chapterId field first, fall back to chapter name
                const chapterName = chapterMap[filterChapterId]?.name;
                constraints = [
                    where('subject', '==', activeSubject),
                    where('chapterId', '==', filterChapterId),
                    limit(300)
                ];

                const snap = await getDocs(query(collection(db, 'questions'), ...constraints));
                if (snap.empty && chapterName) {
                    const fallback = await getDocs(query(
                        collection(db, 'questions'),
                        where('subject', '==', activeSubject),
                        where('chapter', '==', chapterName),
                        limit(300)
                    ));
                    let fetched = fallback.docs.map(d => ({ id: d.id, ...d.data() })) as Question[];
                    if (filterDifficulty !== 'all') fetched = fetched.filter(q => q.difficulty === filterDifficulty);
                    if (filterType !== 'all') fetched = fetched.filter(q => q.type === filterType);
                    setQuestions(fetched);
                    return;
                }

                let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Question[];
                if (filterDifficulty !== 'all') fetched = fetched.filter(q => q.difficulty === filterDifficulty);
                if (filterType !== 'all') fetched = fetched.filter(q => q.type === filterType);
                setQuestions(fetched);
                return;
            }

            const snapshot = await getDocs(query(collection(db, 'questions'), ...constraints));
            let fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Question[];

            // Client-side filtering
            if (filterDifficulty !== 'all') fetched = fetched.filter(q => q.difficulty === filterDifficulty);
            if (filterType !== 'all') fetched = fetched.filter(q => q.type === filterType);

            // Sort by createdAt desc
            fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            setQuestions(fetched);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) return prev.filter(qId => qId !== id);
            if (maxSelection && prev.length >= maxSelection) {
                alert(`You can select up to ${maxSelection} questions.`);
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleConfirm = () => {
        onSelect(selectedIds);
        onClose();
    };

    const filteredQuestions = questions.filter(q =>
        q.text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Pick Specific Questions</h2>
                                <p className="text-sm text-slate-500">
                                    Selected: <span className="font-bold text-teal-600">{selectedIds.length}</span>
                                    {maxSelection && <span className="text-slate-400"> / {maxSelection}</span>}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="p-4 border-b border-slate-100 space-y-3">
                            {/* Subject Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {subjects.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => setActiveSubject(subject)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeSubject === subject
                                            ? 'bg-teal-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {/* Chapter filter */}
                                {availableChapters.length > 0 && (
                                    <select
                                        value={filterChapterId}
                                        onChange={e => setFilterChapterId(e.target.value)}
                                        className="flex-1 min-w-[160px] px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="all">All Chapters</option>
                                        {availableChapters.map(ch => (
                                            <option key={ch.id} value={ch.id}>{ch.name}</option>
                                        ))}
                                    </select>
                                )}

                                {/* Search */}
                                <div className="relative flex-1 min-w-[180px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search question text..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                                    />
                                </div>

                                <select
                                    value={filterDifficulty}
                                    onChange={e => setFilterDifficulty(e.target.value as any)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>

                                <select
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value as any)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                >
                                    <option value="all">All Types</option>
                                    <option value="MCQ">MCQ</option>
                                    <option value="Numerical">Numerical</option>
                                </select>
                            </div>
                        </div>

                        {/* Question List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-teal-600" size={32} />
                                </div>
                            ) : filteredQuestions.length > 0 ? (
                                filteredQuestions.map(question => (
                                    <div
                                        key={question.id}
                                        onClick={() => toggleSelection(question.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedIds.includes(question.id)
                                            ? 'border-teal-500 bg-teal-50/50'
                                            : 'border-white bg-white hover:border-teal-200'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selectedIds.includes(question.id)
                                                ? 'bg-teal-600 border-teal-600'
                                                : 'border-slate-300 bg-white'
                                                }`}>
                                                {selectedIds.includes(question.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                                            </div>

                                            <div className="flex-1 space-y-2 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${question.type === 'MCQ' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                                                        {question.type}
                                                    </span>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                        question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {question.difficulty}
                                                    </span>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <BookOpen size={11} />
                                                        {question.chapter || 'Unknown Chapter'}
                                                    </span>
                                                </div>

                                                <p className="text-slate-800 text-sm font-medium line-clamp-2">
                                                    {question.text?.replace(/<[^>]*>/g, '') || '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                                    <p className="font-medium">No questions found</p>
                                    <p className="text-sm mt-1">Try changing the filters or add questions to this subject</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center gap-3">
                            <span className="text-sm text-slate-500 font-medium">
                                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} shown
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-200 transition-colors"
                                >
                                    Confirm ({selectedIds.length})
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QuestionPicker;
