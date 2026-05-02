import { useState, useEffect } from 'react';
import type { TestFormData, TestSeries } from '../../types/test.types';
import { getAllTestSeries } from '../../services/testSeriesService';
import { subjectService } from '../../services/subjectService';
import { classService } from '../../services/classService';

interface BasicInfoStepProps {
    formData: Partial<TestFormData>;
    updateFormData: (updates: Partial<TestFormData>) => void;
}

const BasicInfoStep = ({ formData, updateFormData }: BasicInfoStepProps) => {
    const [seriesList, setSeriesList] = useState<TestSeries[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const [series, subjects, classes] = await Promise.all([
                    getAllTestSeries(),
                    subjectService.getAll(),
                    classService.getAll()
                ]);
                setSeriesList(series);
                setAvailableSubjects(subjects.map(s => s.name));
                setAvailableClasses(classes.map(c => c.name));
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchSeries();
    }, []);

    const handleSeriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const seriesId = e.target.value;
        const selectedSeries = seriesList.find(s => s.id === seriesId);
        
        const updates: Partial<TestFormData> = { seriesId };
        
        // Auto-fill class and subject from series if available
        if (selectedSeries) {
            if (selectedSeries.courseClass) {
                (updates as any).courseClass = selectedSeries.courseClass;
            }
            if ((selectedSeries as any).subject) {
                (updates as any).subject = (selectedSeries as any).subject;
            }
        }
        
        updateFormData(updates);
    };

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
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Test Series Selection */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Test Series *
                    </label>
                    <select
                        value={formData.seriesId || ''}
                        onChange={handleSeriesChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white ${!formData.seriesId ? 'border-teal-300 bg-teal-50' : 'border-slate-300'
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
                </div>

                {/* Test Type */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Test Type *
                    </label>
                    <select
                        value={formData.testType || 'practice'}
                        onChange={(e) => updateFormData({ testType: e.target.value as any })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                        <option value="practice">Practice Test</option>
                        <option value="mock">Mock Test</option>
                        <option value="previous_year">Previous Year</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Selection */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Target Class
                    </label>
                    <select
                        value={(formData as any).courseClass || ''}
                        onChange={(e) => updateFormData({ courseClass: e.target.value } as any)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                        <option value="">Select Class</option>
                        {availableClasses.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Subject Selection */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Target Subject
                    </label>
                    <select
                        value={(formData as any).subject || ''}
                        onChange={(e) => updateFormData({ subject: e.target.value } as any)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                        <option value="">Select Subject</option>
                        {availableSubjects.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;
