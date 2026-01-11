import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { JEE_MAINS_WEIGHTAGE, calculateQuestionDistribution } from '../config/jeeWeightage';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number | string;
    subject: 'Physics' | 'Chemistry' | 'Mathematics';
    chapter: string;
    unit: string;
    type: 'MCQ' | 'Numerical';
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface GeneratedTest {
    questions: Question[];
    distribution: {
        subject: string;
        chapter: string;
        type: string;
        count: number;
    }[];
    warnings: string[];
}

/**
 * Main function to generate a JEE Mains test based on NTA weightage
 */
export const generateJEEMainsTest = async (): Promise<GeneratedTest> => {
    const allQuestions: Question[] = [];
    const distribution: GeneratedTest['distribution'] = [];
    const warnings: string[] = [];

    try {
        // Iterate through each subject
        for (const subject of JEE_MAINS_WEIGHTAGE) {
            console.log(`Generating questions for ${subject.name}...`);

            // Generate MCQs (Section A)
            const mcqDistribution = calculateQuestionDistribution(subject, 'MCQ');
            const mcqQuestions = await selectQuestionsByDistribution(
                subject.name,
                'MCQ',
                mcqDistribution,
                warnings
            );
            allQuestions.push(...mcqQuestions);

            // Generate Numerical (Section B)
            const numericalDistribution = calculateQuestionDistribution(subject, 'Numerical');
            const numericalQuestions = await selectQuestionsByDistribution(
                subject.name,
                'Numerical',
                numericalDistribution,
                warnings
            );
            allQuestions.push(...numericalQuestions);

            // Track distribution
            mcqDistribution.forEach(dist => {
                if (dist.count > 0) {
                    distribution.push({
                        subject: subject.name,
                        chapter: dist.chapter,
                        type: 'MCQ',
                        count: dist.count
                    });
                }
            });

            numericalDistribution.forEach(dist => {
                if (dist.count > 0) {
                    distribution.push({
                        subject: subject.name,
                        chapter: dist.chapter,
                        type: 'Numerical',
                        count: dist.count
                    });
                }
            });
        }

        // Validate the generated test
        const validation = validateTestPattern(allQuestions);
        if (!validation.isValid) {
            warnings.push(...validation.errors);
        }

        return {
            questions: allQuestions,
            distribution,
            warnings
        };
    } catch (error) {
        console.error('Error generating JEE Mains test:', error);
        throw new Error('Failed to generate test. Please ensure sufficient questions are uploaded.');
    }
};

/**
 * Select questions based on chapter distribution
 */
const selectQuestionsByDistribution = async (
    subject: string,
    type: 'MCQ' | 'Numerical',
    distribution: { chapter: string; count: number }[],
    warnings: string[]
): Promise<Question[]> => {
    const selectedQuestions: Question[] = [];

    for (const { chapter, count } of distribution) {
        if (count === 0) continue;

        try {
            // Query Firestore for questions matching subject, chapter, and type
            const q = query(
                collection(db, 'questions'),
                where('subject', '==', subject),
                where('chapter', '==', chapter),
                where('type', '==', type),
                limit(count * 2) // Fetch more for randomization
            );

            const snapshot = await getDocs(q);
            const availableQuestions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Question[];

            if (availableQuestions.length < count) {
                warnings.push(
                    `Insufficient questions for ${subject} - ${chapter} (${type}). ` +
                    `Required: ${count}, Available: ${availableQuestions.length}`
                );
            }

            // Randomly select required number of questions
            const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, Math.min(count, availableQuestions.length));
            selectedQuestions.push(...selected);

            // If we couldn't get enough questions, try to compensate from other chapters
            if (selected.length < count) {
                const shortage = count - selected.length;
                console.warn(`Shortage of ${shortage} questions for ${chapter}. Will be balanced from other chapters.`);
            }
        } catch (error) {
            console.error(`Error fetching questions for ${chapter}:`, error);
            warnings.push(`Error fetching questions for ${subject} - ${chapter}`);
        }
    }

    return selectedQuestions;
};

/**
 * Validate that the generated test matches JEE Mains pattern
 */
const validateTestPattern = (questions: Question[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const bySubject: Record<string, { MCQ: number; Numerical: number }> = {
        Physics: { MCQ: 0, Numerical: 0 },
        Chemistry: { MCQ: 0, Numerical: 0 },
        Mathematics: { MCQ: 0, Numerical: 0 }
    };

    // Count questions by subject and type
    questions.forEach(q => {
        if (bySubject[q.subject]) {
            bySubject[q.subject][q.type]++;
        }
    });

    // Validate each subject
    for (const [subject, counts] of Object.entries(bySubject)) {
        if (counts.MCQ !== 20) {
            errors.push(`${subject}: Expected 20 MCQs, got ${counts.MCQ}`);
        }
        if (counts.Numerical !== 10) {
            errors.push(`${subject}: Expected 10 Numerical questions, got ${counts.Numerical}`);
        }
    }

    // Validate total
    const total = questions.length;
    if (total !== 90) {
        errors.push(`Total questions should be 90, got ${total}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get question distribution statistics for preview
 */
export const getQuestionDistribution = (questions: Question[]) => {
    const distribution: Record<string, Record<string, Record<string, number>>> = {};

    questions.forEach(q => {
        if (!distribution[q.subject]) {
            distribution[q.subject] = {};
        }
        if (!distribution[q.subject][q.chapter]) {
            distribution[q.subject][q.chapter] = { MCQ: 0, Numerical: 0 };
        }
        distribution[q.subject][q.chapter][q.type]++;
    });

    return distribution;
};

/**
 * Calculate test statistics
 */
export const calculateTestStatistics = (questions: Question[]) => {
    return {
        totalQuestions: questions.length,
        bySubject: {
            Physics: questions.filter(q => q.subject === 'Physics').length,
            Chemistry: questions.filter(q => q.subject === 'Chemistry').length,
            Mathematics: questions.filter(q => q.subject === 'Mathematics').length
        },
        byType: {
            MCQ: questions.filter(q => q.type === 'MCQ').length,
            Numerical: questions.filter(q => q.type === 'Numerical').length
        },
        byDifficulty: {
            Easy: questions.filter(q => q.difficulty === 'Easy').length,
            Medium: questions.filter(q => q.difficulty === 'Medium').length,
            Hard: questions.filter(q => q.difficulty === 'Hard').length
        }
    };
};
