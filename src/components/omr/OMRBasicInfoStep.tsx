import { useState, useEffect } from 'react';
import type { OMRTestFormData } from '../../types/omr.types';
import { getAllTestSeries } from '../../services/testSeriesService';
import { FileText, FlaskConical, BookMarked } from 'lucide-react';

interface OMRBasicInfoStepProps {
    formData: Partial<OMRTestFormData>;
    updateFormData: (updates: Partial<OMRTestFormData>) => void;
}

const TEST_TYPE_OPTIONS = [
    { value: 'practice', label: 'Practice Test', desc: 'Practice for students', icon: BookMarked, color: 'blue' },
    { value: 'mock', label: 'Mock Test', desc: 'Full simulation exam', icon: FlaskConical, color: 'purple' },
    { value: 'previous_year', label: 'Previous Year', desc: 'Past exam papers', icon: FileText, color: 'green' },
];

const OMRBasicInfoStep = ({ formData, updateFormData }: OMRBasicInfoStepProps) => {
    const [seriesList, setSeriesList] = useState<{ id: string; name: string }[]>([]);
    const [loadingSeries, setLoadingSeries] = useState(false);

    useEffect(() => {
        const fetchSeries = async () => {
            setLoadingSeries(true);
            try {
                const series = await getAllTestSeries();
                setSeriesList(series.map(s => ({ id: s.id, name: s.name })));
            } catch (error) {
                console.error('Failed to fetch test series', error);
            } finally {
                setLoadingSeries(false);
            }
        };
        fetchSeries();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Basic Information</h2>
                <p className="text-slate-500 text-sm">Enter basic details for your OMR-based test</p>
            </div>

            {/* OMR Badge */}
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-xl">📄</div>
                <div>
                    <p className="font-bold text-teal-900 text-sm">OMR-Based Test</p>
                    <p className="text-teal-700 text-xs mt-0.5">Students will fill a bubble sheet (OMR) style interface — simulating real pen-paper exams</p>
                </div>
            </div>

            {/* Test Name */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Test Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="e.g., JEE Mains OMR Mock Test #1"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-800"
                />
            </div>


            {/* Test Series */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Test Series <span className="text-red-500">*</span>
                </label>
                <select
                    value={formData.seriesId || ''}
                    onChange={(e) => updateFormData({ seriesId: e.target.value })}
                    disabled={loadingSeries}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white transition-all ${!formData.seriesId ? 'border-teal-300 bg-teal-50' : 'border-slate-300'
                        }`}
                >
                    <option value="">{loadingSeries ? 'Loading series...' : 'Select a Test Series'}</option>
                    {seriesList.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Select the series this OMR test belongs to.</p>
            </div>

            {/* Test Type */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Test Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {TEST_TYPE_OPTIONS.map(({ value, label, desc, icon: Icon, color }) => {
                        const isSelected = formData.testType === value;
                        const colorMap: Record<string, string> = {
                            blue: isSelected ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-slate-300',
                            purple: isSelected ? 'border-purple-600 bg-purple-50' : 'border-slate-200 hover:border-slate-300',
                            green: isSelected ? 'border-green-600 bg-green-50' : 'border-slate-200 hover:border-slate-300',
                        };
                        const iconColorMap: Record<string, string> = {
                            blue: 'text-teal-600',
                            purple: 'text-purple-600',
                            green: 'text-green-600',
                        };
                        return (
                            <label
                                key={value}
                                className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${colorMap[color]}`}
                            >
                                <input
                                    type="radio"
                                    name="testType"
                                    value={value}
                                    checked={isSelected}
                                    onChange={() => updateFormData({ testType: value as any })}
                                    className="sr-only"
                                />
                                <Icon size={20} className={`mb-2 ${iconColorMap[color]}`} />
                                <span className="font-semibold text-slate-800 text-sm">{label}</span>
                                <span className="text-xs text-slate-500 mt-1">{desc}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OMRBasicInfoStep;
