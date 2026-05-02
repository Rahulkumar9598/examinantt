import { useState, useEffect } from 'react';
import type { TestFormData } from '../../types/test.types';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface QuestionConfigStepProps {
    formData: Partial<TestFormData>;
    updateFormData: (updates: Partial<TestFormData>) => void;
}

const QuestionConfigStep = ({ formData, updateFormData }: QuestionConfigStepProps) => {
    const [mcqPercentage, setMCQPercentage] = useState(formData.questionConfig?.mcqPercentage || 67);
    const [availableCount, setAvailableCount] = useState<number | null>(null);
    const [isCounting, setIsCounting] = useState(false);
    
    const isSpecific = formData.customConfig?.questionSelection === 'specific';
    const selectedCount = formData.customConfig?.selectedQuestionIds?.length || 0;
    
    // Fetch total questions in selected chapters if in 'all' mode
    useEffect(() => {
        if (!isSpecific && formData.customConfig?.selectedChapters) {
            const fetchCount = async () => {
                setIsCounting(true);
                try {
                    let total = 0;
                    const subjects = Object.keys(formData.customConfig!.selectedChapters!);
                    
                    for (const subject of subjects) {
                        const chapterIds = formData.customConfig!.selectedChapters![subject];
                        for (const chapterId of chapterIds) {
                            const selectedTopics = formData.customConfig?.selectedTopics?.[chapterId] || [];
                            
                            
                            // Get chapter info for fallback
                            const chapterSnap = await getDoc(doc(db, 'chapters', chapterId));
                            const chapterName = chapterSnap.exists() ? chapterSnap.data().name : null;

                            if (selectedTopics.length > 0) {
                                // Count questions only in selected topics
                                for (const topicName of selectedTopics) {
                                    // Try by chapterId + topic
                                    let q = query(
                                        collection(db, 'questions'),
                                        where('subject', '==', subject),
                                        where('chapterId', '==', chapterId),
                                        where('topic', '==', topicName)
                                    );
                                    let snap = await getDocs(q);
                                    
                                    // If empty, try by chapter name + topic
                                    if (snap.empty && chapterName) {
                                        q = query(
                                            collection(db, 'questions'),
                                            where('subject', '==', subject),
                                            where('chapter', '==', chapterName),
                                            where('topic', '==', topicName)
                                        );
                                        snap = await getDocs(q);
                                    }
                                    total += snap.size;
                                }
                            } else {
                                // Count all questions in chapter
                                // Try by chapterId
                                let q = query(
                                    collection(db, 'questions'),
                                    where('subject', '==', subject),
                                    where('chapterId', '==', chapterId)
                                );
                                let snap = await getDocs(q);
                                
                                // If empty, try by chapter name
                                if (snap.empty && chapterName) {
                                    q = query(
                                        collection(db, 'questions'),
                                        where('subject', '==', subject),
                                        where('chapter', '==', chapterName)
                                    );
                                    snap = await getDocs(q);
                                }
                                total += snap.size;
                            }
                        }
                    }
                    setAvailableCount(total);
                } catch (error) {
                    console.error("Error counting questions:", error);
                } finally {
                    setIsCounting(false);
                }
            };
            fetchCount();
        }
    }, [isSpecific, formData.customConfig?.selectedChapters, formData.customConfig?.selectedTopics]);

    // Use selectedCount if mode is specific, otherwise use availableCount (if fetched) or form value or default
    const totalQuestions = isSpecific 
        ? selectedCount 
        : (availableCount !== null ? availableCount : (formData.questionConfig?.totalQuestions || 90));

    // Sync totalQuestions to parent if it changed
    useEffect(() => {
        if (formData.questionConfig?.totalQuestions !== totalQuestions) {
            updateFormData({
                questionConfig: {
                    ...formData.questionConfig!,
                    totalQuestions: totalQuestions,
                    mcqPercentage: mcqPercentage,
                    numericalPercentage: 100 - mcqPercentage
                }
            });
        }
    }, [totalQuestions, availableCount]);

    const handleMCQChange = (value: number) => {
        setMCQPercentage(value);
        updateFormData({
            questionConfig: {
                ...formData.questionConfig!,
                totalQuestions: totalQuestions,
                mcqPercentage: value,
                numericalPercentage: 100 - value
            }
        });
    };

    const mcqCount = Math.round((mcqPercentage / 100) * totalQuestions);
    const numericalCount = totalQuestions - mcqCount;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Question Configuration</h2>
                <p className="text-slate-500">
                    {isSpecific 
                        ? `Configuring distribution for ${totalQuestions} hand-picked questions.` 
                        : isCounting 
                            ? 'Counting available questions in selected chapters...' 
                            : 'Configure the distribution of questions to be auto-generated.'}
                </p>
            </div>

            {/* Total Questions Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                            Total Assessment Questions
                        </label>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            {isCounting ? (
                                <Loader2 className="animate-spin text-teal-600" size={24} />
                            ) : (
                                totalQuestions
                            )}
                            <span className="text-slate-400 text-lg font-bold">Questions</span>
                        </h3>
                    </div>
                    {isSpecific && (
                        <div className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-xs font-black uppercase tracking-widest border border-teal-100">
                            Manual Selection Mode
                        </div>
                    )}
                    {!isSpecific && availableCount !== null && (
                        <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-black uppercase tracking-widest border border-green-100">
                            {availableCount} Found in Chapters
                        </div>
                    )}
                </div>

                {!isSpecific && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Adjust Total Count (Auto-Generate)
                        </label>
                        <input
                            type="number"
                            value={totalQuestions}
                            onChange={(e) => updateFormData({
                                questionConfig: {
                                    ...formData.questionConfig!,
                                    totalQuestions: Number(e.target.value)
                                }
                            })}
                            min="1"
                            max="300"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold"
                        />
                    </div>
                )}
            </div>

            {/* MCQ/Numerical Split - Only show if NOT specific */}
            {!isSpecific && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
                    <div>
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                            MCQ / Numerical Distribution
                        </label>

                        <div className="space-y-8">
                            {/* MCQ Slider */}
                            <div className="group">
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm font-bold text-slate-700">MCQ Questions</span>
                                    <span className="text-sm font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-lg">{mcqCount} ({mcqPercentage}%)</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={mcqPercentage}
                                    onChange={(e) => handleMCQChange(Number(e.target.value))}
                                    className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-teal-600 hover:bg-slate-200 transition-colors"
                                />
                            </div>

                            {/* Numerical Display */}
                            <div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm font-bold text-slate-700">Numerical Questions</span>
                                    <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">{numericalCount} ({100 - mcqPercentage}%)</span>
                                </div>
                                <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-purple-500 transition-all duration-500" 
                                        style={{ width: `${100 - mcqPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Visual Bar */}
                            <div className="flex h-16 rounded-2xl overflow-hidden border-4 border-slate-50 shadow-inner">
                                <div
                                    style={{ width: `${mcqPercentage}%` }}
                                    className="bg-teal-500 flex items-center justify-center text-white font-black text-xs uppercase tracking-tighter transition-all duration-500"
                                >
                                    {mcqCount > 0 && `${mcqCount} MCQ`}
                                </div>
                                <div
                                    style={{ width: `${100 - mcqPercentage}%` }}
                                    className="bg-purple-500 flex items-center justify-center text-white font-black text-xs uppercase tracking-tighter transition-all duration-500"
                                >
                                    {numericalCount > 0 && `${numericalCount} Numerical`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Summary for Specific Selection */}
            {isSpecific && (
                <div className="bg-teal-600 rounded-2xl p-8 text-white shadow-xl shadow-teal-500/20">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-80 mb-4">Selection Summary</h3>
                    <p className="text-xl font-bold leading-relaxed">
                        You have hand-picked <span className="text-teal-400 font-black underline decoration-2 underline-offset-4">{totalQuestions} questions</span> for this assessment. 
                        The distribution will be fixed based on your manual selection.
                    </p>
                </div>
            )}
        </div>
    );
};

export default QuestionConfigStep;
