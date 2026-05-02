import { useState } from 'react';
import type { OMRTestFormData, OMRQuestionMapping, OMRSection } from '../../types/omr.types';
import { ChevronDown, ChevronRight, KeyRound } from 'lucide-react';

interface OMRQuestionAssignStepProps {
    formData: Partial<OMRTestFormData>;
    updateFormData: (updates: Partial<OMRTestFormData>) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

const OMRQuestionAssignStep = ({ formData, updateFormData }: OMRQuestionAssignStepProps) => {
    const sections: OMRSection[] = (formData.omrTemplate?.sections as OMRSection[]) || [];
    const mappings: OMRQuestionMapping[] = formData.questionMappings || [];
    const [expandedSection, setExpandedSection] = useState<string>(sections[0]?.id || '');

    // Initialize mappings if not already done
    const initMappings = () => {
        if (mappings.length > 0) return mappings;
        const init: OMRQuestionMapping[] = [];
        sections.forEach((sec) => {
            for (let i = sec.questionStartIndex; i <= sec.questionEndIndex; i++) {
                init.push({
                    serialNumber: i,
                    correctOption: '',
                    type: sec.optionsPerQuestion === 0 ? 'Numerical' : 'MCQ',
                    subject: sec.subject || '',
                });
            }
        });
        return init;
    };

    const getMappingsForSection = (sec: OMRSection) => {
        const current = initMappings();
        return current.filter(
            (m) => m.serialNumber >= sec.questionStartIndex && m.serialNumber <= sec.questionEndIndex
        );
    };

    const updateMapping = (serialNumber: number, updates: Partial<OMRQuestionMapping>) => {
        const current = initMappings();
        const updated = current.map((m) =>
            m.serialNumber === serialNumber ? { ...m, ...updates } : m
        );
        updateFormData({ questionMappings: updated });
    };

    const setAllForSection = (sec: OMRSection, option: string) => {
        const current = initMappings();
        const updated = current.map((m) =>
            m.serialNumber >= sec.questionStartIndex && m.serialNumber <= sec.questionEndIndex
                ? { ...m, correctOption: option }
                : m
        );
        updateFormData({ questionMappings: updated });
    };

    const totalFilled = initMappings().filter((m) => m.correctOption && m.correctOption !== '').length;
    const totalQ = formData.omrTemplate?.totalQuestions || 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Answer Key Configuration</h2>
                <p className="text-slate-500 text-sm">
                    Enter the correct answer for each question. This forms the answer key for evaluation.
                </p>
            </div>

            {/* Progress */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <KeyRound size={16} className="text-teal-500" /> Answer Key Progress
                    </span>
                    <span className="text-sm font-bold text-teal-600">{totalFilled} / {totalQ} filled</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: totalQ > 0 ? `${(totalFilled / totalQ) * 100}%` : '0%' }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                    You can skip answer key now — students can still attempt the test; scoring won't work until keys are filled.
                </p>
            </div>

            {sections.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 text-sm">No sections configured yet. Please go back and set up the OMR template.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sections.map((sec) => {
                        const isExpanded = expandedSection === sec.id;
                        const secMappings = getMappingsForSection(sec);
                        const secFilled = secMappings.filter((m) => m.correctOption).length;
                        const isNumerical = sec.optionsPerQuestion === 0;

                        return (
                            <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                {/* Section Header */}
                                <button
                                    type="button"
                                    onClick={() => setExpandedSection(isExpanded ? '' : sec.id)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800">{sec.name}</p>
                                            <p className="text-xs text-slate-500">
                                                Q{sec.questionStartIndex}–Q{sec.questionEndIndex} • {isNumerical ? 'Numerical' : `${sec.optionsPerQuestion} options`} • +{sec.marksCorrect}/{sec.marksWrong}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${secFilled === sec.questionCount ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
                                            {secFilled}/{sec.questionCount} filled
                                        </span>
                                        {!isNumerical && (
                                            <div className="flex gap-1">
                                                {OPTION_LABELS.slice(0, sec.optionsPerQuestion).map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setAllForSection(sec, opt); }}
                                                        className="px-2 py-0.5 bg-white border border-slate-300 text-xs rounded hover:bg-teal-100 hover:border-teal-400 transition-colors font-semibold"
                                                        title={`Set all to ${opt}`}
                                                    >
                                                        All {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {/* Answer Key Grid */}
                                {isExpanded && (
                                    <div className="p-4 bg-white">
                                        {isNumerical ? (
                                            <div className="flex flex-col gap-4">
                                                {secMappings.map((m) => (
                                                    <div key={m.serialNumber} className="flex flex-col md:flex-row items-start gap-4 p-4 border border-slate-100 bg-slate-50 rounded-xl">
                                                        <div className="flex-1 w-full relative">
                                                            <span className="absolute top-3 left-3 text-xs font-bold text-slate-400">Q{m.serialNumber}</span>
                                                            <textarea
                                                                value={m.questionText || ''}
                                                                onChange={(e) => updateMapping(m.serialNumber, { questionText: e.target.value })}
                                                                placeholder="Type question description and options here..."
                                                                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 min-h-[80px]"
                                                            />
                                                        </div>
                                                        <div className="w-full md:w-48 flex items-center gap-2 mt-2 md:mt-0">
                                                            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Correct Value:</span>
                                                            <input
                                                                type="text"
                                                                value={m.correctOption || ''}
                                                                onChange={(e) => updateMapping(m.serialNumber, { correctOption: e.target.value })}
                                                                placeholder="Value"
                                                                className="flex-1 px-2 py-2 border border-slate-200 rounded-lg text-sm text-center font-mono focus:outline-none focus:border-teal-400"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-4">
                                                {secMappings.map((m) => (
                                                    <div key={m.serialNumber} className="flex flex-col md:flex-row items-start gap-4 p-4 border border-slate-100 bg-slate-50 rounded-xl">
                                                        <div className="flex-1 w-full relative">
                                                            <span className="absolute top-3 left-3 text-xs font-bold text-slate-400">Q{m.serialNumber}</span>
                                                            <textarea
                                                                value={m.questionText || ''}
                                                                onChange={(e) => updateMapping(m.serialNumber, { questionText: e.target.value })}
                                                                placeholder="Type question description and options here..."
                                                                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 min-h-[80px]"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2 mt-2 md:mt-0 items-center">
                                                            <span className="text-xs font-bold text-slate-500">Correct Option</span>
                                                            <div className="flex gap-1">
                                                                {OPTION_LABELS.slice(0, sec.optionsPerQuestion).map((opt) => (
                                                                    <button
                                                                        key={opt}
                                                                        type="button"
                                                                        onClick={() => updateMapping(m.serialNumber, { correctOption: m.correctOption === opt ? '' : opt })}
                                                                        className={`w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${m.correctOption === opt
                                                                                ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                                                                                : 'bg-white border-slate-300 text-slate-600 hover:border-teal-400'
                                                                            }`}
                                                                    >
                                                                        {opt}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OMRQuestionAssignStep;
