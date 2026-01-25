import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, CheckCircle, XCircle, MinusCircle, Clock,
    Award, BarChart2, Loader2, BookOpen, Filter
} from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number | string;
    subject: string;
    type: 'MCQ' | 'Numerical';
    explanation?: string;
    section?: string;
}

interface AttemptData {
    id: string;
    testId: string;
    testTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    attemptedQuestions: number;
    duration: number;
    answers: Record<number, number | string>;
    attemptDate: any;
}

const StudentTestResultDetailPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const auth = useAuth();

    const [attempt, setAttempt] = useState<AttemptData | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!attemptId || !auth?.currentUser) return;

            try {
                // 1. Fetch Attempt Data
                const attemptRef = doc(db, 'users', auth.currentUser.uid, 'attempts', attemptId);
                const attemptSnap = await getDoc(attemptRef);

                if (!attemptSnap.exists()) {
                    alert("Result not found");
                    navigate('/dashboard/results');
                    return;
                }

                const attemptData = { id: attemptSnap.id, ...attemptSnap.data() } as AttemptData;
                setAttempt(attemptData);

                // 2. Fetch Test Questions to display details
                // We need the test ID from the attempt to fetch the original questions
                const testRef = doc(db, 'tests', attemptData.testId);
                const testSnap = await getDoc(testRef);

                if (testSnap.exists()) {
                    const testData = testSnap.data();
                    const questionIds = testData.questionIds || [];

                    if (questionIds.length > 0) {
                        const questionPromises = questionIds.map((id: string) => getDoc(doc(db, 'questions', id)));
                        const questionSnaps = await Promise.all(questionPromises);

                        const loadedQuestions = questionSnaps
                            .filter(q => q.exists())
                            .map(q => ({ id: q.id, ...q.data() } as Question));

                        setQuestions(loadedQuestions);
                    }
                }

            } catch (error) {
                console.error("Error loading result details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [attemptId, auth?.currentUser, navigate]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const getAnswerStatus = (questionIndex: number, question: Question) => {
        const userAnswer = attempt?.answers[questionIndex];

        if (userAnswer === undefined || userAnswer === null || userAnswer === '') return 'unattempted';

        if (String(userAnswer) === String(question.correctAnswer)) return 'correct';
        return 'incorrect';
    };

    const filteredQuestions = questions.map((q, idx) => ({ ...q, index: idx, status: getAnswerStatus(idx, q) }))
        .filter(q => activeFilter === 'all' || q.status === activeFilter);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    if (!attempt) return null;

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/results')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{attempt.testTitle} - Result Analysis</h1>
                    <p className="text-slate-500 text-sm">
                        Attempted on {attempt.attemptDate?.toDate().toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Score</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {attempt.score} <span className="text-sm text-slate-400 font-normal">/ {questions.length * 4}</span>
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Correct</p>
                        <h3 className="text-2xl font-bold text-slate-800">{attempt.correctAnswers}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Incorrect</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {attempt.attemptedQuestions - attempt.correctAnswers}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Time Taken</p>
                        <h3 className="text-2xl font-bold text-slate-800">{formatDuration(attempt.duration || 0)}</h3>
                    </div>
                </div>
            </div>

            {/* Analysis Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen size={20} className="text-blue-500" />
                        Question Analysis
                    </h2>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {(['all', 'correct', 'incorrect', 'unattempted'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${activeFilter === filter
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredQuestions.map((q) => {
                        const status = q.status;
                        const userAnswer = attempt.answers[q.index];

                        return (
                            <div key={q.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${status === 'correct' ? 'bg-green-100 text-green-700' :
                                                status === 'incorrect' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>
                                            {q.index + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap gap-2 items-center text-xs mb-1">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                                {q.subject}
                                            </span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                                {q.type}
                                            </span>
                                            {status === 'correct' && (
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                                    <CheckCircle size={12} /> Correct (+4)
                                                </span>
                                            )}
                                            {status === 'incorrect' && (
                                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                                    <XCircle size={12} /> Incorrect (-1)
                                                </span>
                                            )}
                                            {status === 'unattempted' && (
                                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                                    <MinusCircle size={12} /> Unattempted (0)
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-slate-800 font-medium text-lg leading-relaxed">
                                            {q.text}
                                        </p>

                                        {q.type === 'MCQ' ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt, optIdx) => {
                                                    const isSelected = userAnswer === optIdx;
                                                    const isCorrect = String(q.correctAnswer) === String(optIdx);

                                                    let className = "p-3 rounded-lg border-2 text-sm flex items-center gap-3 ";
                                                    if (isCorrect) className += "border-green-500 bg-green-50 text-green-900";
                                                    else if (isSelected && !isCorrect) className += "border-red-500 bg-red-50 text-red-900";
                                                    else className += "border-slate-100 text-slate-600 opacity-70";

                                                    return (
                                                        <div key={optIdx} className={className}>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isCorrect ? 'border-green-600 bg-green-600 text-white' :
                                                                    isSelected ? 'border-red-600 bg-red-600 text-white' :
                                                                        'border-slate-300'
                                                                }`}>
                                                                {(isCorrect || isSelected) && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                            <span className="font-medium">{opt}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex gap-4">
                                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                    <span className="text-xs text-slate-500 block">Your Answer</span>
                                                    <span className={`font-mono font-bold ${status === 'correct' ? 'text-green-600' :
                                                            status === 'incorrect' ? 'text-red-600' : 'text-slate-400'
                                                        }`}>
                                                        {userAnswer ?? 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <span className="text-xs text-green-600 block">Correct Answer</span>
                                                    <span className="font-mono font-bold text-green-700">{q.correctAnswer}</span>
                                                </div>
                                            </div>
                                        )}

                                        {q.explanation && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
                                                <p className="font-bold mb-1 flex items-center gap-2">
                                                    <BookOpen size={16} /> Explanation:
                                                </p>
                                                {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredQuestions.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No questions found matching this filter.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentTestResultDetailPage;
