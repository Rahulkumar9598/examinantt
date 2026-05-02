import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import type { TestFormData } from '../../types/test.types';
import { createTest, generateQuestionsCustom, saveQuestionsToTest, publishTest } from '../../services/testService';

// Import step components (we'll create these next)
import BasicInfoStep from '../../components/test/BasicInfoStep';
import GenerationMethodStep from '../../components/test/GenerationMethodStep';
import QuestionConfigStep from '../../components/test/QuestionConfigStep';
import TestSettingsStep from '../../components/test/TestSettingsStep';
import ScheduleStep from '../../components/test/ScheduleStep';
import ReviewStep from '../../components/test/ReviewStep';

interface TestCreationWizardProps {
    seriesId?: string;
    onComplete?: () => void;
    onCancel?: () => void;
}

import { useAuth } from '../../contexts/AuthContext';

const TestCreationWizard = ({ seriesId, onComplete, onCancel }: TestCreationWizardProps) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth() || {};
    const [currentStep, setCurrentStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const [formData, setFormData] = useState<Partial<TestFormData>>({
        name: '',
        seriesId: seriesId || '',
        testType: 'practice',
        generationType: 'custom',
        questionConfig: {
            totalQuestions: 90,
            mcqPercentage: 67,
            numericalPercentage: 33
        },
        settings: {
            duration: 180,
            marksPerQuestion: 4,
            negativeMarking: -1,
            allowReview: true,
            showSolutions: true,
            shuffleQuestions: true,
            shuffleOptions: true
        },
        status: 'draft'
    });

    const steps = [
        { title: 'Basic Info', component: BasicInfoStep },
        { title: 'Subjects & Chapters', component: GenerationMethodStep },
        { title: 'Question Config', component: QuestionConfigStep },
        { title: 'Test Settings', component: TestSettingsStep },
        { title: 'Schedule', component: ScheduleStep },
        { title: 'Review & Publish', component: ReviewStep }
    ];

    const CurrentStepComponent = steps[currentStep].component;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            await delay(1000); // Artificial delay
            await createTest(formData as TestFormData, currentUser?.uid || 'admin');
            alert('Test saved as draft!');
            if (onComplete) {
                onComplete();
            } else {
                navigate('/admin-dashboard/tests');
            }
        } catch (error: any) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        setIsSaving(true);
        setIsGenerating(true);

        try {
            await delay(1500); // Artificial delay
            // Step 1: Create test
            const testId = await createTest({ ...formData, status: 'published' } as TestFormData, currentUser?.uid || 'admin');

            // Step 2: Generate questions from selected chapters/specific picks
            let questionIds: string[] = [];

            if (formData.customConfig?.questionSelection === 'specific' && formData.customConfig.selectedQuestionIds) {
                // Admin hand-picked specific questions
                questionIds = formData.customConfig.selectedQuestionIds;
            } else if (formData.customConfig && formData.customConfig.subjects && formData.customConfig.selectedChapters && formData.questionConfig) {
                // Fetch all questions from selected chapters
                questionIds = await generateQuestionsCustom(formData.customConfig as any, formData.questionConfig);
            }

            // Step 3: Save questions to test
            await saveQuestionsToTest(testId, questionIds);

            // Step 4: Publish
            await publishTest(testId);

            alert(`Test published successfully with ${questionIds.length} questions!`);
            if (onComplete) {
                onComplete();
            } else {
                navigate('/admin-dashboard/tests');
            }
        } catch (error: any) {
            console.error('Error publishing test:', error);
            alert('Failed to publish test: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSaving(false);
            setIsGenerating(false);
        }
    };

    const updateFormData = (updates: Partial<TestFormData>) => {
        setFormData({ ...formData, ...updates });
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: // Basic Info
                return !!(formData.name && formData.testType && formData.seriesId);
            case 1: // Subjects & Chapters
                // Need at least one subject AND either chapters selected or specific questions picked
                if (!formData.customConfig?.subjects || formData.customConfig.subjects.length === 0) return false;
                if (formData.customConfig.questionSelection === 'specific') {
                    return (formData.customConfig.selectedQuestionIds?.length || 0) > 0;
                }
                // For 'all' mode: at least one chapter must be selected across any subject
                const totalChapters = Object.values(formData.customConfig.selectedChapters || {}).reduce(
                    (sum, arr) => sum + arr.length, 0
                );
                return totalChapters > 0;
            case 2: // Question Config
                return formData.questionConfig && formData.questionConfig.totalQuestions > 0;
            case 3: // Test Settings
                return formData.settings && formData.settings.duration > 0;
            default:
                return true;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Create New Test</h1>
                            <p className="text-slate-500 mt-1">Follow the steps to configure your test</p>
                        </div>
                        <button
                            onClick={onCancel || (() => navigate('/admin-dashboard/tests'))}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${index < currentStep
                                        ? 'bg-green-500 text-white'
                                        : index === currentStep
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-slate-200 text-slate-500'
                                        }`}>
                                        {index < currentStep ? <Check size={20} /> : index + 1}
                                    </div>
                                    <span className={`text-xs mt-2 text-center ${index <= currentStep ? 'text-slate-800 font-semibold' : 'text-slate-500'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-1 flex-1 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-slate-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-xl shadow-md p-6 mb-6"
                    >
                        <CurrentStepComponent formData={formData} updateFormData={updateFormData} />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft size={20} /> Back
                    </button>

                    <div className="flex gap-3">
                        {currentStep === steps.length - 1 && (
                            <button
                                onClick={handleSaveDraft}
                                disabled={isSaving}
                                className="px-6 py-2.5 border border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Save Draft'}
                            </button>
                        )}

                        {currentStep === steps.length - 1 ? (
                            <button
                                onClick={handlePublish}
                                disabled={isSaving || isGenerating}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Generating Questions...
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} /> Publish Test
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next <ArrowRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCreationWizard;
