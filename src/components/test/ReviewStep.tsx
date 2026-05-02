import type { TestFormData } from '../../types/test.types';
import { Check } from 'lucide-react';

interface ReviewStepProps {
    formData: Partial<TestFormData>;
    updateFormData: (updates: Partial<TestFormData>) => void;
}

const ReviewStep = ({ formData }: ReviewStepProps) => {
    const totalMarks = (formData.questionConfig?.totalQuestions || 0) * (formData.settings?.marksPerQuestion || 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Review & Publish</h2>
                <p className="text-slate-500">Review all settings before publishing the test</p>
            </div>

            {/* Test Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Check className="text-green-600" size={20} />
                    Test Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500">Name:</span>
                        <span className="ml-2 font-semibold text-slate-800">{formData.name}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Type:</span>
                        <span className="ml-2 font-semibold text-slate-800 capitalize">{formData.testType?.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>

            {/* Question Configuration */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Check className="text-green-600" size={20} />
                    Question Configuration
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-teal-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-teal-600">{formData.questionConfig?.totalQuestions}</div>
                        <div className="text-sm text-slate-600">Total Questions</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {Math.round((formData.questionConfig?.mcqPercentage || 0) * (formData.questionConfig?.totalQuestions || 0) / 100)}
                        </div>
                        <div className="text-sm text-slate-600">MCQ</div>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-pink-600">
                            {Math.round((formData.questionConfig?.numericalPercentage || 0) * (formData.questionConfig?.totalQuestions || 0) / 100)}
                        </div>
                        <div className="text-sm text-slate-600">Numerical</div>
                    </div>
                </div>
                <div className="text-sm text-slate-600">
                    <strong>Generation Method:</strong>{' '}
                    {formData.generationType === 'auto' ? 'Auto-generate with JEE weightage' : 'Custom topic selection'}
                </div>
                {formData.autoConfig && formData.autoConfig.subjects && (
                    <div className="flex gap-2">
                        {formData.autoConfig.subjects.map(subject => (
                            <span key={subject} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                                {subject}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Test Settings */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Check className="text-green-600" size={20} />
                    Test Settings
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500">Duration:</span>
                        <span className="ml-2 font-semibold text-slate-800">{formData.settings?.duration} minutes</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Total Marks:</span>
                        <span className="ml-2 font-semibold text-green-600">{totalMarks}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Per Question:</span>
                        <span className="ml-2 font-semibold text-slate-800">+{formData.settings?.marksPerQuestion}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Negative:</span>
                        <span className="ml-2 font-semibold text-red-600">{formData.settings?.negativeMarking}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                    {formData.settings?.allowReview && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Review Allowed</span>
                    )}
                    {formData.settings?.showSolutions && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Show Solutions</span>
                    )}
                    {formData.settings?.shuffleQuestions && (
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">Shuffle Questions</span>
                    )}
                </div>
            </div>

            {/* Schedule */}
            {formData.schedule?.isScheduled && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Check className="text-green-600" size={20} />
                        Schedule
                    </h3>
                    <div className="text-sm text-slate-600">
                        Test will be available from <strong>{formData.schedule.startDate?.toString()}</strong> to{' '}
                        <strong>{formData.schedule.endDate?.toString()}</strong>
                    </div>
                </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-bold text-yellow-800 mb-2">Before Publishing</h3>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Questions will be automatically generated based on your configuration</li>
                    <li>Once published, the test will be available to students</li>
                    <li>You can save as draft to make changes later</li>
                </ul>
            </div>
        </div>
    );
};

export default ReviewStep;
