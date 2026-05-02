import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, FileText } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { addTestToSeries } from '../../services/testSeriesService';
import { useAuth } from '../../contexts/AuthContext';
import type { OMRTestFormData } from '../../types/omr.types';

// Import OMR wizard steps
import OMRBasicInfoStep from '../../components/omr/OMRBasicInfoStep';
import OMRTemplateStep from '../../components/omr/OMRTemplateStep';
import OMRQuestionAssignStep from '../../components/omr/OMRQuestionAssignStep';
import OMRReviewStep from '../../components/omr/OMRReviewStep';

const STEPS = [
    { title: 'Basic Info', component: OMRBasicInfoStep },
    { title: 'OMR Template', component: OMRTemplateStep },
    { title: 'Answer Key', component: OMRQuestionAssignStep },
    { title: 'Review & Publish', component: OMRReviewStep },
];

const OMRTestCreationWizard = () => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;

    const [currentStep, setCurrentStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<OMRTestFormData>>({
        name: '',
        seriesId: '',
        testType: 'mock',
        omrTemplate: {},
        questionMappings: [],
        settings: {
            duration: 180,
            instructions: '',
            showResultsImmediately: true,
        },
        status: 'draft',
    });

    const CurrentStepComponent = STEPS[currentStep].component;

    const updateFormData = (updates: Partial<OMRTestFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep((s) => s - 1);
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 0:
                return !!(formData.name && formData.seriesId && formData.testType);
            case 1:
                return !!(
                    formData.omrTemplate?.sections &&
                    formData.omrTemplate.sections.length > 0 &&
                    formData.settings?.duration &&
                    formData.settings.duration > 0
                );
            case 2:
                return true; // Answer key is optional
            case 3:
                return true;
            default:
                return true;
        }
    };

    const saveToFirestore = async (status: 'draft' | 'published') => {
        if (!currentUser) {
            alert('You must be logged in.');
            return;
        }
        setIsSaving(true);
        try {
            const docData = {
                ...formData,
                status,
                isOMR: true,
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                stats: { totalAttempts: 0, averageScore: 0 },
            };

            const docRef = await addDoc(collection(db, 'tests'), docData);

            // Link test to test series
            if (formData.seriesId) {
                await addTestToSeries(formData.seriesId, docRef.id);
            }

            alert(
                status === 'published'
                    ? '✅ OMR Test published successfully!'
                    : '💾 OMR Test saved as draft!'
            );
            navigate('/admin-dashboard/tests');
        } catch (error: any) {
            console.error('Error saving OMR test:', error);
            alert('Failed to save OMR test: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 p-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-md border border-teal-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                                <FileText className="text-teal-600" size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Create OMR-Based Test</h1>
                                <p className="text-slate-500 text-sm mt-0.5">Design a paper-style bubble sheet test</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/admin-dashboard/tests')}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-sm hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            ✕ Cancel
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center">
                        {STEPS.map((step, index) => (
                            <div key={index} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${index < currentStep
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                            : index === currentStep
                                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-200'
                                                : 'bg-slate-200 text-slate-500'
                                            }`}
                                    >
                                        {index < currentStep ? <Check size={18} /> : index + 1}
                                    </div>
                                    <span
                                        className={`text-xs mt-2 text-center font-medium ${index <= currentStep ? 'text-slate-800' : 'text-slate-400'
                                            }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 rounded-full transition-all ${index < currentStep ? 'bg-green-400' : 'bg-slate-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white rounded-2xl shadow-md border border-teal-100 p-6 mb-6"
                    >
                        <CurrentStepComponent formData={formData} updateFormData={updateFormData} />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="bg-white rounded-2xl shadow-md border border-teal-100 p-6 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>

                    <div className="flex gap-3">
                        {currentStep === STEPS.length - 1 && (
                            <>
                                <button
                                    onClick={() => saveToFirestore('draft')}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 border-2 border-teal-500 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save as Draft'}
                                </button>
                                <button
                                    onClick={() => saveToFirestore('published')}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-200"
                                >
                                    {isSaving ? (
                                        <><Loader2 className="animate-spin" size={18} /> Publishing...</>
                                    ) : (
                                        <><Check size={18} /> Publish OMR Test</>
                                    )}
                                </button>
                            </>
                        )}

                        {currentStep < STEPS.length - 1 && (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-teal-200"
                            >
                                Next <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OMRTestCreationWizard;
