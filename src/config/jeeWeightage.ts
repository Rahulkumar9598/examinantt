// JEE Mains 2024 Weightage Configuration
// Based on NTA official pattern and historical analysis

export interface ChapterWeightage {
    name: string;
    percentage: number;
    questionsCount?: number; // Calculated dynamically
}

export interface SubjectWeightage {
    name: 'Physics' | 'Chemistry' | 'Mathematics';
    totalQuestions: number;
    sectionA: number; // MCQs (compulsory)
    sectionB: number; // Numerical (10 available, 5 required)
    chapters: ChapterWeightage[];
}

export const JEE_MAINS_WEIGHTAGE: SubjectWeightage[] = [
    {
        name: 'Physics',
        totalQuestions: 30,
        sectionA: 20,
        sectionB: 10,
        chapters: [
            { name: 'Current Electricity', percentage: 10.0 },
            { name: 'Electrostatics', percentage: 6.6 },
            { name: 'Magnetism & Moving Charges', percentage: 6.6 },
            { name: 'EMI & Alternating Current', percentage: 6.6 },
            { name: 'Ray & Wave Optics', percentage: 6.6 },
            { name: 'Modern Physics', percentage: 6.6 },
            { name: 'Kinetic Theory of Gases & Thermodynamics', percentage: 6.6 },
            { name: 'Rotational Motion', percentage: 6.6 },
            { name: 'Simple Harmonic Motion', percentage: 6.6 },
            { name: 'Heat & Thermodynamics', percentage: 5.0 },
            { name: 'Laws of Motion', percentage: 5.0 },
            { name: 'Work, Energy & Power', percentage: 5.0 },
            { name: 'Gravitation', percentage: 3.3 },
            { name: 'Mechanical Properties of Solids', percentage: 3.3 },
            { name: 'Mechanical Properties of Fluids', percentage: 3.3 },
            { name: 'Waves', percentage: 3.3 },
            { name: 'Units & Measurement', percentage: 3.3 },
            { name: 'Kinematics', percentage: 3.3 },
            { name: 'Semiconductor Electronics', percentage: 2.0 },
        ]
    },
    {
        name: 'Chemistry',
        totalQuestions: 30,
        sectionA: 20,
        sectionB: 10,
        chapters: [
            // Organic Chemistry (High Weightage)
            { name: 'General Organic Chemistry', percentage: 10.0 },
            { name: 'Isomerism', percentage: 7.0 },
            { name: 'Aromatic Compounds', percentage: 6.6 },
            { name: 'Carbonyl Compounds', percentage: 6.6 },
            { name: 'Hydrocarbons', percentage: 5.0 },
            { name: 'Biomolecules', percentage: 3.3 },
            { name: 'Polymers', percentage: 3.3 },
            { name: 'Chemistry in Everyday Life', percentage: 2.0 },

            // Physical Chemistry
            { name: 'Liquid Solutions', percentage: 7.0 },
            { name: 'Chemical Kinetics', percentage: 6.6 },
            { name: 'Electrochemistry', percentage: 6.6 },
            { name: 'Mole Concept', percentage: 5.0 },
            { name: 'Redox Reactions', percentage: 5.0 },
            { name: 'Thermodynamics & Thermochemistry', percentage: 5.0 },
            { name: 'Chemical Equilibrium', percentage: 3.3 },
            { name: 'Ionic Equilibrium', percentage: 3.3 },
            { name: 'Solid State', percentage: 3.3 },
            { name: 'Atomic Structure', percentage: 2.0 },

            // Inorganic Chemistry
            { name: 'Coordination Compounds', percentage: 6.6 },
            { name: 'Chemical Bonding', percentage: 5.0 },
            { name: 'Periodic Table & Periodicity', percentage: 3.3 },
            { name: 'd & f Block Elements', percentage: 3.3 },
            { name: 'p Block Elements', percentage: 3.3 },
            { name: 's Block Elements', percentage: 2.0 },
        ]
    },
    {
        name: 'Mathematics',
        totalQuestions: 30,
        sectionA: 20,
        sectionB: 10,
        chapters: [
            { name: 'Coordinate Geometry', percentage: 10.0 },
            { name: 'Integral Calculus', percentage: 10.0 },
            { name: '3D Geometry', percentage: 6.6 },
            { name: 'Vector Algebra', percentage: 6.6 },
            { name: 'Matrices & Determinants', percentage: 6.6 },
            { name: 'Limits, Continuity & Differentiability', percentage: 6.6 },
            { name: 'Differential Equations', percentage: 6.6 },
            { name: 'Definite Integration', percentage: 6.6 },
            { name: 'Application of Derivatives', percentage: 5.0 },
            { name: 'Probability', percentage: 5.0 },
            { name: 'Sequences & Series', percentage: 5.0 },
            { name: 'Complex Numbers', percentage: 5.0 },
            { name: 'Binomial Theorem', percentage: 3.3 },
            { name: 'Permutation & Combination', percentage: 3.3 },
            { name: 'Trigonometry', percentage: 3.3 },
            { name: 'Quadratic Equations', percentage: 3.3 },
            { name: 'Sets, Relations & Functions', percentage: 3.3 },
            { name: 'Statistics', percentage: 3.3 },
        ]
    }
];

// Helper function to calculate question count for each chapter
export const calculateQuestionDistribution = (subject: SubjectWeightage, questionType: 'MCQ' | 'Numerical') => {
    const totalForType = questionType === 'MCQ' ? subject.sectionA : subject.sectionB;
    const distribution: { chapter: string; count: number }[] = [];

    let allocated = 0;

    // First pass: allocate based on percentage
    subject.chapters.forEach((chapter) => {
        const idealCount = (chapter.percentage / 100) * totalForType;
        const roundedCount = Math.round(idealCount);

        distribution.push({
            chapter: chapter.name,
            count: roundedCount
        });

        allocated += roundedCount;
    });

    // Adjust if total doesn't match due to rounding
    const difference = totalForType - allocated;

    if (difference !== 0) {
        // Find chapters with highest decimal remainders
        const remainders = subject.chapters.map((chapter, index) => ({
            index,
            remainder: ((chapter.percentage / 100) * totalForType) - distribution[index].count
        }));

        remainders.sort((a, b) => Math.abs(b.remainder) - Math.abs(a.remainder));


        // Distribute the difference
        for (let i = 0; i < Math.abs(difference); i++) {
            if (difference > 0) {
                distribution[remainders[i].index].count++;
            } else {
                distribution[remainders[i].index].count--;
            }
        }
    }

    return distribution;
};

// Get total questions needed for JEE Mains pattern
export const JEE_MAINS_TOTAL_QUESTIONS = 90;
export const QUESTIONS_PER_SUBJECT = 30;
export const MCQ_PER_SUBJECT = 20;
export const NUMERICAL_PER_SUBJECT = 10;
export const NUMERICAL_TO_ATTEMPT = 5;

// Marking scheme
export const MARKS_PER_CORRECT = 4;
export const NEGATIVE_MARKS = -1;
export const TOTAL_MARKS = 300;
export const MARKS_PER_SUBJECT = 100;
