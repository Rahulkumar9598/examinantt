import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timer, AlertCircle, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

interface TestData {
    id: string;
    title: string;
    questions: Question[];
    duration?: number; // in minutes
}

const StudentTestAttemptPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;

    const [testData, setTestData] = useState<TestData | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({}); // questionIndex -> optionIndex
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(3 * 60 * 60); // Default 3 hours

    useEffect(() => {
        const fetchTest = async () => {
            if (testId) {
                try {
                    const docRef = doc(db, 'testSeries', testId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setTestData({ id: docSnap.id, ...docSnap.data() } as TestData);
                    } else {
                        alert('Test not found');
                        navigate('/dashboard/tests');
                    }
                } catch (error) {
                    console.error("Error fetching test:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchTest();
    }, [testId, navigate]);

    // Timer Logic (Simplified)
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!currentUser || !testData) return;
        if (!window.confirm("Are you sure you want to submit the test?")) return;

        setIsSubmitting(true);
        try {
            // Calculate Score
            let score = 0;
            let correctCount = 0;

            // Note: If questions don't have correctAnswer yet (incomplete admin), this defaults to 0 score
            testData.questions.forEach((q, idx) => {
                if (answers[idx] === q.correctAnswer) {
                    score += 4; // Check marking scheme
                    correctCount++;
                } else if (answers[idx] !== undefined) {
                    score -= 1; // Negative marking
                }
            });

            const resultData = {
                testId: testData.id,
                testTitle: testData.title,
                score: score,
                totalQuestions: testData.questions.length,
                correctAnswers: correctCount,
                attemptDate: serverTimestamp(),
                answers: answers // Store user answers for review
            };

            await addDoc(collection(db, 'users', currentUser.uid, 'attempts'), resultData);

            alert(`Test Submitted! Your Score: ${score}/${testData.questions.length * 4}`);
            navigate('/dashboard/tests');

        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Failed to submit test. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-slate-500 font-medium">Loading your test environment...</p>
                </div>
            </div>
        );
    }

    if (!testData) return <div>Test failed to load.</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header / Timer */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard/tests')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800 line-clamp-1">{testData.title}</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                        <Timer size={20} />
                        {formatTime(timeRemaining)}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-70"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Submit Test
                    </button>
                </div>
            </header>

            {/* Test Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8">
                {testData.questions && testData.questions.length > 0 ? (
                    testData.questions.map((q, qIdx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={q.id || qIdx}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                        >
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-600 font-bold rounded-lg flex items-center justify-center text-sm">
                                    {qIdx + 1}
                                </span>
                                <div className="flex-1 space-y-4">
                                    <p className="text-lg font-medium text-slate-900">{q.text}</p>
                                    <div className="space-y-3">
                                        {q.options.map((option, oIdx) => (
                                            <label
                                                key={oIdx}
                                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${answers[qIdx] === oIdx
                                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                                    : 'border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${answers[qIdx] === oIdx
                                                    ? 'border-blue-600 bg-blue-600'
                                                    : 'border-slate-300 bg-white'
                                                    }`}>
                                                    {answers[qIdx] === oIdx && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <span className="text-slate-700">{option}</span>
                                                <input
                                                    type="radio"
                                                    name={`q-${qIdx}`}
                                                    className="hidden"
                                                    checked={answers[qIdx] === oIdx}
                                                    onChange={() => handleOptionSelect(qIdx, oIdx)}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <AlertCircle className="mx-auto text-slate-400 mb-2" size={40} />
                        <h3 className="text-lg font-bold text-slate-600">No questions found</h3>
                        <p className="text-slate-500">This test series doesn't have any questions uploaded yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentTestAttemptPage;
