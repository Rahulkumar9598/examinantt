import { useState, useEffect } from 'react';
import type { TestFormData } from '../../types/test.types';
import { ChevronDown, ChevronRight, CheckSquare, Square, Search, BookOpen, Loader2 } from 'lucide-react';
import QuestionPicker from './QuestionPicker';
import { useSubjectList } from '../../hooks/useSubjectList';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Chapter {
    id: string;
    name: string;
    subject: string;
    unit?: string;
    topics?: string[];
    status?: string;
}

interface GenerationMethodStepProps {
    formData: Partial<TestFormData>;
    updateFormData: (updates: Partial<TestFormData>) => void;
}

const GenerationMethodStep = ({ formData, updateFormData }: GenerationMethodStepProps) => {
    const availableSubjects = useSubjectList();

    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
        formData.customConfig?.subjects || []
    );
    const [activeSubjectTab, setActiveSubjectTab] = useState<string>(selectedSubjects[0] || '');

    // chapters grouped by subject
    const [chaptersBySubject, setChaptersBySubject] = useState<Record<string, Chapter[]>>({});
    const [loadingSubject, setLoadingSubject] = useState<string | null>(null);
    // tracks which subjects we've already attempted to fetch (even if result was [])
    const [fetchedSubjects, setFetchedSubjects] = useState<Set<string>>(new Set());

    // expand/collapse units
    const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

    const [isQuestionPickerOpen, setIsQuestionPickerOpen] = useState(false);

    // Always default to custom mode
    useEffect(() => {
        if (formData.generationType !== 'custom') {
            updateFormData({ generationType: 'custom' });
        }
    }, []);

    // Whenever selectedSubjects changes, fetch chapters for subjects not yet attempted
    useEffect(() => {
        selectedSubjects.forEach(subject => {
            if (!fetchedSubjects.has(subject)) {
                fetchChaptersForSubject(subject);
            }
        });
    }, [selectedSubjects]);

    const fetchChaptersForSubject = async (subject: string) => {
        setLoadingSubject(subject);
        try {
            // Only filter by subject — avoids needing a composite Firestore index
            const q = query(
                collection(db, 'chapters'),
                where('subject', '==', subject)
            );
            const snapshot = await getDocs(q);
            const fetched: Chapter[] = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as Chapter))
                .filter(ch => ch.status !== 'archived') // exclude archived, client-side
                .sort((a, b) => a.name.localeCompare(b.name));   // sort client-side

            console.log(`Fetched ${fetched.length} chapters for subject: ${subject}`);
            setChaptersBySubject(prev => ({ ...prev, [subject]: fetched }));
            setFetchedSubjects(prev => new Set(prev).add(subject));
        } catch (err) {
            console.error('Error fetching chapters for', subject, err);
            setChaptersBySubject(prev => ({ ...prev, [subject]: [] }));
            setFetchedSubjects(prev => new Set(prev).add(subject));
        } finally {
            setLoadingSubject(null);
        }
    };

    // Retry fetching for the active subject tab
    const retryFetch = (subject: string) => {
        setFetchedSubjects(prev => { const s = new Set(prev); s.delete(subject); return s; });
        setChaptersBySubject(prev => { const c = { ...prev }; delete c[subject]; return c; });
        fetchChaptersForSubject(subject);
    };

    const toggleSubject = (subject: string) => {
        const updated = selectedSubjects.includes(subject)
            ? selectedSubjects.filter(s => s !== subject)
            : [...selectedSubjects, subject];

        setSelectedSubjects(updated);

        if (!updated.includes(activeSubjectTab) && updated.length > 0) {
            setActiveSubjectTab(updated[0]);
        } else if (updated.length === 0) {
            setActiveSubjectTab('');
        }

        updateFormData({
            generationType: 'custom',
            customConfig: {
                ...formData.customConfig,
                subjects: updated,
                selectedUnits: formData.customConfig?.selectedUnits || {},
                selectedChapters: formData.customConfig?.selectedChapters || {},
                selectedTopics: formData.customConfig?.selectedTopics || {},
                questionSelection: formData.customConfig?.questionSelection || 'all'
            }
        });
    };

    const handleTopicToggle = (chapterId: string, topic: string) => {
        const currentTopics = formData.customConfig?.selectedTopics?.[chapterId] || [];
        const isSelected = currentTopics.includes(topic);
        const newTopics = isSelected
            ? currentTopics.filter(t => t !== topic)
            : [...currentTopics, topic];

        updateFormData({
            customConfig: {
                ...formData.customConfig!,
                selectedTopics: {
                    ...formData.customConfig?.selectedTopics,
                    [chapterId]: newTopics
                }
            }
        });
        
        // If selecting a topic, make sure the chapter is also selected
        if (!isSelected) {
            const currentChapters = formData.customConfig?.selectedChapters?.[activeSubjectTab] || [];
            if (!currentChapters.includes(chapterId)) {
                handleChapterToggle(activeSubjectTab, chapterId, false);
            }
        }
    };

    const handleChapterToggle = (subject: string, chapterId: string, isSelected: boolean) => {
        const currentChapters = formData.customConfig?.selectedChapters?.[subject] || [];
        const newChapters = isSelected
            ? currentChapters.filter(c => c !== chapterId)
            : [...currentChapters, chapterId];

        updateFormData({
            customConfig: {
                ...formData.customConfig!,
                selectedChapters: {
                    ...formData.customConfig?.selectedChapters,
                    [subject]: newChapters
                }
            }
        });
    };

    const handleSelectAllChapters = (subject: string, allIds: string[], allSelected: boolean) => {
        const currentChapters = formData.customConfig?.selectedChapters?.[subject] || [];
        const newChapters = allSelected
            ? currentChapters.filter(c => !allIds.includes(c))
            : Array.from(new Set([...currentChapters, ...allIds]));

        updateFormData({
            customConfig: {
                ...formData.customConfig!,
                selectedChapters: {
                    ...formData.customConfig?.selectedChapters,
                    [subject]: newChapters
                }
            }
        });
    };

    const renderChapterList = () => {
        if (selectedSubjects.length === 0) return null;

        const chapters = chaptersBySubject[activeSubjectTab] || [];
        const selectedChapters = formData.customConfig?.selectedChapters?.[activeSubjectTab] || [];

        // Group by unit
        const grouped: Record<string, Chapter[]> = {};
        chapters.forEach(ch => {
            const unit = ch.unit || 'General';
            if (!grouped[unit]) grouped[unit] = [];
            grouped[unit].push(ch);
        });

        return (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-6 shadow-sm">
                {/* Selection Mode */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="questionSelection"
                                checked={(formData.customConfig?.questionSelection || 'all') === 'all'}
                                onChange={() => updateFormData({
                                    customConfig: { ...formData.customConfig || {} as any, questionSelection: 'all' }
                                })}
                                className="text-teal-600"
                            />
                            <span className="text-sm font-medium text-slate-700">All Questions from Selected Chapters</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="questionSelection"
                                checked={formData.customConfig?.questionSelection === 'specific'}
                                onChange={() => updateFormData({
                                    customConfig: { ...formData.customConfig || {} as any, questionSelection: 'specific' }
                                })}
                                className="text-teal-600"
                            />
                            <span className="text-sm font-medium text-slate-700">Pick Specific Questions</span>
                        </label>
                    </div>
                    {selectedChapters.length > 0 && (
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
                            {selectedChapters.length} chapter{selectedChapters.length !== 1 ? 's' : ''} selected
                        </span>
                    )}
                </div>

                {formData.customConfig?.questionSelection === 'specific' ? (
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={28} className="text-teal-500" />
                        </div>
                        <p className="text-slate-600 font-medium mb-2">
                            {formData.customConfig.selectedQuestionIds?.length
                                ? `${formData.customConfig.selectedQuestionIds.length} questions selected`
                                : 'No questions selected yet'}
                        </p>
                        <p className="text-slate-400 text-sm mb-4">Open the picker to hand-pick specific questions from the question bank</p>
                        <button
                            onClick={() => setIsQuestionPickerOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-semibold shadow-md transition-all"
                        >
                            <Search size={18} /> Open Question Picker
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Subject Tabs */}
                        <div className="flex border-b border-slate-200 overflow-x-auto">
                            {selectedSubjects.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => setActiveSubjectTab(subject)}
                                    className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeSubjectTab === subject
                                        ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {subject}
                                    {loadingSubject === subject && <Loader2 size={14} className="animate-spin" />}
                                </button>
                            ))}
                        </div>

                        {/* Chapter Tree */}
                        <div className="p-4 max-h-[500px] overflow-y-auto">
                            {loadingSubject === activeSubjectTab ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-teal-500" size={32} />
                                </div>
                            ) : chapters.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                                    <p className="font-medium text-slate-600">No chapters found for {activeSubjectTab}</p>
                                    <p className="text-sm mt-1">Make sure you've added chapters for this subject in the Chapters section</p>
                                    <button
                                        onClick={() => retryFetch(activeSubjectTab)}
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 font-semibold rounded-lg hover:bg-teal-100 text-sm transition-colors border border-teal-200"
                                    >
                                        <Loader2 size={14} /> Retry
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(grouped).map(([unitName, unitChapters]) => {
                                        const unitId = `${activeSubjectTab}-${unitName}`;
                                        const isExpanded = expandedUnits[unitId] !== false; // default expanded
                                        const unitChapterIds = unitChapters.map(c => c.id);
                                        const allSelected = unitChapterIds.every(id => selectedChapters.includes(id));
                                        const someSelected = unitChapterIds.some(id => selectedChapters.includes(id));

                                        return (
                                            <div key={unitName} className="border border-slate-200 rounded-xl overflow-hidden">
                                                {/* Unit Header */}
                                                <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setExpandedUnits(prev => ({ ...prev, [unitId]: !isExpanded }))}
                                                            className="p-1 hover:bg-slate-200 rounded"
                                                        >
                                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                        </button>

                                                        <button
                                                            onClick={() => handleSelectAllChapters(activeSubjectTab, unitChapterIds, allSelected)}
                                                            className="text-slate-500 hover:text-teal-600 transition-colors"
                                                        >
                                                            {allSelected ? (
                                                                <CheckSquare size={20} className="text-teal-600" />
                                                            ) : someSelected ? (
                                                                <div className="w-5 h-5 bg-teal-100 border-2 border-teal-600 rounded flex items-center justify-center">
                                                                    <div className="w-2.5 h-2.5 bg-teal-600 rounded-sm" />
                                                                </div>
                                                            ) : (
                                                                <Square size={20} />
                                                            )}
                                                        </button>

                                                        <span
                                                            className="font-semibold text-slate-700 cursor-pointer select-none"
                                                            onClick={() => setExpandedUnits(prev => ({ ...prev, [unitId]: !isExpanded }))}
                                                        >
                                                            {unitName}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded border">
                                                        {unitChapters.length} Chapter{unitChapters.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                {/* Chapters in unit */}
                                                {isExpanded && (
                                                    <div className="p-3 pl-12 space-y-2 bg-white border-t border-slate-100">
                                                        {unitChapters.map(chapter => {
                                                            const isSelected = selectedChapters.includes(chapter.id);
                                                            return (
                                                                <label key={chapter.id} className="flex items-center gap-3 cursor-pointer group py-1">
                                                                    <button
                                                                        onClick={() => handleChapterToggle(activeSubjectTab, chapter.id, isSelected)}
                                                                        className={`shrink-0 transition-colors ${isSelected ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-400'}`}
                                                                    >
                                                                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                                                    </button>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-sm ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                                                                                {chapter.name}
                                                                            </span>
                                                                            {chapter.topics && chapter.topics.length > 0 && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        setExpandedTopics(prev => ({ ...prev, [chapter.id]: !expandedTopics[chapter.id] }));
                                                                                    }}
                                                                                    className="p-0.5 hover:bg-slate-100 rounded text-slate-400"
                                                                                >
                                                                                    {expandedTopics[chapter.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {/* Topic List */}
                                                                        {expandedTopics[chapter.id] && chapter.topics && (
                                                                            <div className="mt-2 ml-4 space-y-1 border-l-2 border-slate-100 pl-3">
                                                                                {/* Select All Topics Toggle */}
                                                                                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-50">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const allSelected = chapter.topics!.every(t => formData.customConfig?.selectedTopics?.[chapter.id]?.includes(t));
                                                                                            const newTopics = allSelected ? [] : [...chapter.topics!];
                                                                                            updateFormData({
                                                                                                customConfig: {
                                                                                                    ...formData.customConfig!,
                                                                                                    selectedTopics: {
                                                                                                        ...formData.customConfig?.selectedTopics,
                                                                                                        [chapter.id]: newTopics
                                                                                                    }
                                                                                                }
                                                                                            });
                                                                                        }}
                                                                                        className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-0.5 rounded transition-colors"
                                                                                    >
                                                                                        {chapter.topics!.every(t => formData.customConfig?.selectedTopics?.[chapter.id]?.includes(t)) ? 'Deselect All Topics' : 'Select All Topics'}
                                                                                    </button>
                                                                                </div>

                                                                                {chapter.topics.map(topic => {
                                                                                    const isTopicSelected = formData.customConfig?.selectedTopics?.[chapter.id]?.includes(topic);
                                                                                    return (
                                                                                        <label key={topic} className="flex items-center gap-2 cursor-pointer group/topic py-0.5">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={isTopicSelected || false}
                                                                                                onChange={() => handleTopicToggle(chapter.id, topic)}
                                                                                                className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                                                                            />
                                                                                            <span className={`text-xs ${isTopicSelected ? 'text-teal-600 font-medium' : 'text-slate-500 group-hover/topic:text-slate-700'}`}>
                                                                                                {topic}
                                                                                            </span>
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Select Subjects & Chapters</h2>
                <p className="text-slate-500">Choose which subjects and chapters to include in this test</p>
            </div>

            {/* Subject Selection */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Subjects *
                </label>
                {availableSubjects.length === 0 ? (
                    <div className="flex items-center gap-2 text-slate-400 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Loading subjects...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSubjects.map(subject => (
                            <label
                                key={subject}
                                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all text-sm font-semibold ${selectedSubjects.includes(subject)
                                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                                    : 'border-slate-200 hover:border-teal-300 text-slate-700 bg-white'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSubjects.includes(subject)}
                                    onChange={() => toggleSubject(subject)}
                                    className="sr-only"
                                />
                                {selectedSubjects.includes(subject) ? (
                                    <CheckSquare size={18} className="text-teal-600 shrink-0" />
                                ) : (
                                    <Square size={18} className="text-slate-400 shrink-0" />
                                )}
                                {subject}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Chapter selection (shown once at least 1 subject selected) */}
            {selectedSubjects.length > 0 && renderChapterList()}

            {/* Question Picker Modal */}
            <QuestionPicker
                isOpen={isQuestionPickerOpen}
                onClose={() => setIsQuestionPickerOpen(false)}
                subjects={selectedSubjects}
                selectedChapterIds={formData.customConfig?.selectedChapters}
                initialSelected={formData.customConfig?.selectedQuestionIds || []}
                onSelect={(ids) => updateFormData({
                    customConfig: {
                        ...formData.customConfig!,
                        selectedQuestionIds: ids,
                        questionSelection: 'specific'
                    }
                })}
            />
        </div>
    );
};

export default GenerationMethodStep;
