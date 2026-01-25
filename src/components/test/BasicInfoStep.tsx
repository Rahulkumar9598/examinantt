import { useState, useEffect } from 'react';
import type { TestFormData } from '../../types/test.types';
import { getAllTestSeries } from '../../services/testSeriesService';

interface BasicInfoStepProps {
    formData: Partial<TestFormData>;
    updateFormData: (updates: Partial<TestFormData>) => void;
}

const BasicInfoStep = ({ formData, updateFormData }: BasicInfoStepProps) => {
    const [seriesList, setSeriesList] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const series = await getAllTestSeries();
                setSeriesList(series.map(s => ({ id: s.id, name: s.name })));
            } catch (error) {
                console.error("Failed to fetch test series", error);
            }
        };
        fetchSeries();
    }, []);
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Basic Information</h2>
                <p className="text-slate-500">Enter the basic details for your test</p>
            </div>

            {/* Test Name */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Test Name *
                </label>
                <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="e.g., JEE Mains Mock Test #1"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Test Series Selection */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Test Series *
                </label>
                <select
                    value={formData.seriesId || ''}
                    onChange={(e) => updateFormData({ seriesId: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${!formData.seriesId ? 'border-amber-300 bg-amber-50' : 'border-slate-300'
                        }`}
                    required
                >
                    <option value="">Select a Test Series</option>
                    {seriesList.map((series) => (
                        <option key={series.id} value={series.id}>
                            {series.name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                    Select the series this test belongs to (Required).
                </p>
            </div>

            {/* Test Type */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Test Type *
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { value: 'practice', label: 'Practice Test', desc: 'Practice for students' },
                        { value: 'mock', label: 'Mock Test', desc: 'Full simulation' },
                        { value: 'previous_year', label: 'Previous Year', desc: 'Past exam papers' }
                    ].map((type) => (
                        <label
                            key={type.value}
                            className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.testType === type.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="testType"
                                value={type.value}
                                checked={formData.testType === type.value}
                                onChange={(e) => updateFormData({ testType: e.target.value as any })}
                                className="sr-only"
                            />
                            <span className="font-semibold text-slate-800">{type.label}</span>
                            <span className="text-xs text-slate-500 mt-1">{type.desc}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;
