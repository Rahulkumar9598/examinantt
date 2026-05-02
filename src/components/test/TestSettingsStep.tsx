import type { TestFormData } from '../../types/test.types';

interface TestSettingsStepProps {
    formData: Partial<TestFormData>;
    updateFormData: (updates: Partial<TestFormData>) => void;
}

const TestSettingsStep = ({ formData, updateFormData }: TestSettingsStepProps) => {
    const settings = formData.settings || {
        duration: 180,
        marksPerQuestion: 4,
        negativeMarking: -1,
        allowReview: true,
        showSolutions: true,
        shuffleQuestions: true,
        shuffleOptions: true
    };

    const updateSettings = (key: string, value: any) => {
        updateFormData({
            settings: {
                ...settings,
                [key]: value
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Test Settings</h2>
                <p className="text-slate-500">Configure test duration, marking scheme, and other settings</p>
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Test Duration (minutes) *
                    </label>
                    <input
                        type="number"
                        value={settings.duration}
                        onChange={(e) => updateSettings('duration', Number(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">{Math.floor(settings.duration / 60)}h {settings.duration % 60}m</p>
                </div>

                {/* Marks Per Question */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Marks Per Question *
                    </label>
                    <input
                        type="number"
                        value={settings.marksPerQuestion}
                        onChange={(e) => updateSettings('marksPerQuestion', Number(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            </div>

            {/* Negative Marking */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Negative Marking
                </label>
                <input
                    type="number"
                    value={settings.negativeMarking}
                    onChange={(e) => updateSettings('negativeMarking', Number(e.target.value))}
                    step="0.25"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-slate-500 mt-1">Use negative values (e.g., -1 for 1 mark deduction)</p>
            </div>

            {/* Passing Percentage */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Passing Percentage (optional)
                </label>
                <input
                    type="number"
                    value={settings.passingPercentage || ''}
                    onChange={(e) => updateSettings('passingPercentage', e.target.value ? Number(e.target.value) : undefined)}
                    min="0"
                    max="100"
                    placeholder="e.g., 40"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* Instructions */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Test Instructions (optional)
                </label>
                <textarea
                    value={settings.instructions || ''}
                    onChange={(e) => updateSettings('instructions', e.target.value)}
                    rows={4}
                    placeholder="Enter instructions for students..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Additional Settings</h3>

                {[
                    { key: 'allowReview', label: 'Allow question review during test' },
                    { key: 'showSolutions', label: 'Show solutions after submission' },
                    { key: 'shuffleQuestions', label: 'Shuffle question order' },
                    { key: 'shuffleOptions', label: 'Shuffle MCQ options' }
                ].map(setting => (
                    <label key={setting.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                        <input
                            type="checkbox"
                            checked={settings[setting.key as keyof typeof settings] as boolean}
                            onChange={(e) => updateSettings(setting.key, e.target.checked)}
                            className="w-5 h-5 text-teal-600 rounded"
                        />
                        <span className="text-sm text-slate-700">{setting.label}</span>
                    </label>
                ))}
            </div>

            {/* Summary */}
            <div className="bg-teal-50 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 mb-3">Test Configuration Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-600">Duration:</span>
                        <span className="ml-2 font-semibold text-slate-800">{settings.duration} minutes</span>
                    </div>
                    <div>
                        <span className="text-slate-600">Per Question:</span>
                        <span className="ml-2 font-semibold text-slate-800">+{settings.marksPerQuestion} marks</span>
                    </div>
                    <div>
                        <span className="text-slate-600">Negative:</span>
                        <span className="ml-2 font-semibold text-red-600">{settings.negativeMarking} marks</span>
                    </div>
                    <div>
                        <span className="text-slate-600">Total Marks:</span>
                        <span className="ml-2 font-semibold text-green-600">
                            {(formData.questionConfig?.totalQuestions || 0) * settings.marksPerQuestion} marks
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestSettingsStep;
