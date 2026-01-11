import Papa from 'papaparse';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// ========== TYPES ==========

export interface ChapterCSVRow {
    name: string;
    subject: string;
    unit: string;
    description: string;
    topics: string;
    difficulty: string;
    status: string;
}

export interface QuestionCSVRow {
    text: string;
    subject: string;
    chapter: string;
    topic: string;
    type: string;
    difficulty: string;
    marks: string;
    negativeMarks: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    isDuplicate?: boolean; // New flag for duplicates
}

export interface ParsedData<T> {
    data: T[];
    errors: any[];
}

// ========== CSV PARSERS ==========

export const parseChaptersCSV = (file: File): Promise<ParsedData<ChapterCSVRow>> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve({
                    data: results.data as ChapterCSVRow[],
                    errors: results.errors
                });
            },
            error: (error) => reject(error)
        });
    });
};

export const parseQuestionsCSV = (file: File): Promise<ParsedData<QuestionCSVRow>> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve({
                    data: results.data as QuestionCSVRow[],
                    errors: results.errors
                });
            },
            error: (error) => reject(error)
        });
    });
};

// ========== VALIDATORS ==========

export const validateChapter = async (row: ChapterCSVRow, index: number): Promise<ValidationResult> => {
    const errors: string[] = [];

    // Required fields
    if (!row.name || row.name.trim() === '') {
        errors.push(`Row ${index + 1}: Chapter name is required`);
    }

    if (!row.subject || row.subject.trim() === '') {
        errors.push(`Row ${index + 1}: Subject is required`);
    } else if (!['Physics', 'Chemistry', 'Mathematics'].includes(row.subject)) {
        errors.push(`Row ${index + 1}: Subject must be Physics, Chemistry, or Mathematics`);
    }

    if (!row.description || row.description.trim() === '') {
        errors.push(`Row ${index + 1}: Description is required`);
    }

    if (!row.topics || row.topics.trim() === '') {
        errors.push(`Row ${index + 1}: Topics are required`);
    }

    // Optional fields with validation
    if (row.difficulty && !['Easy', 'Medium', 'Hard'].includes(row.difficulty)) {
        errors.push(`Row ${index + 1}: Difficulty must be Easy, Medium, or Hard`);
    }

    if (row.status && !['active', 'draft', 'archived'].includes(row.status)) {
        errors.push(`Row ${index + 1}: Status must be active, draft, or archived`);
    }

    // Check for duplicates if basic validation passed
    let isDuplicate = false;
    if (errors.length === 0 && row.name && row.subject) {
        try {
            const duplicateQuery = query(
                collection(db, 'chapters'),
                where('name', '==', row.name.trim()),
                where('subject', '==', row.subject.trim())
            );
            const snapshot = await getDocs(duplicateQuery);
            if (!snapshot.empty) {
                isDuplicate = true;
                errors.push(`Row ${index + 1}: Duplicate - Chapter "${row.name}" already exists for ${row.subject}`);
            }
        } catch (error) {
            console.error('Error checking for duplicates:', error);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        isDuplicate
    };
};

export const validateQuestion = async (row: QuestionCSVRow, index: number): Promise<ValidationResult> => {
    const errors: string[] = [];

    // Required fields
    if (!row.text || row.text.trim() === '') {
        errors.push(`Row ${index + 1}: Question text is required`);
    }

    if (!row.subject || !['Physics', 'Chemistry', 'Mathematics'].includes(row.subject)) {
        errors.push(`Row ${index + 1}: Valid subject is required (Physics/Chemistry/Mathematics)`);
    }

    if (!row.chapter || row.chapter.trim() === '') {
        errors.push(`Row ${index + 1}: Chapter is required`);
    }

    if (!row.topic || row.topic.trim() === '') {
        errors.push(`Row ${index + 1}: Topic is required`);
    }

    if (!row.type || !['MCQ', 'Numerical'].includes(row.type)) {
        errors.push(`Row ${index + 1}: Type must be MCQ or Numerical`);
    }

    if (!row.difficulty || !['Easy', 'Medium', 'Hard'].includes(row.difficulty)) {
        errors.push(`Row ${index + 1}: Difficulty must be Easy, Medium, or Hard`);
    }

    if (!row.marks || isNaN(Number(row.marks)) || Number(row.marks) <= 0) {
        errors.push(`Row ${index + 1}: Marks must be a positive number`);
    }

    // Type-specific validation
    if (row.type === 'MCQ') {
        if (!row.optionA || !row.optionB || !row.optionC || !row.optionD) {
            errors.push(`Row ${index + 1}: MCQ questions must have all 4 options`);
        }

        const correctAns = Number(row.correctAnswer);
        if (isNaN(correctAns) || correctAns < 0 || correctAns > 3) {
            errors.push(`Row ${index + 1}: MCQ correctAnswer must be 0, 1, 2, or 3`);
        }
    }

    if (row.type === 'Numerical') {
        if (isNaN(Number(row.correctAnswer))) {
            errors.push(`Row ${index + 1}: Numerical correctAnswer must be a number`);
        }
    }

    // Verify chapter exists (if no other errors so far)
    if (errors.length === 0 && row.chapter && row.subject) {
        try {
            const chaptersQuery = query(
                collection(db, 'chapters'),
                where('name', '==', row.chapter),
                where('subject', '==', row.subject)
            );
            const snapshot = await getDocs(chaptersQuery);

            if (snapshot.empty) {
                errors.push(`Row ${index + 1}: Chapter "${row.chapter}" not found for subject ${row.subject}`);
            } else {
                // Verify topic exists in chapter
                const chapterData = snapshot.docs[0].data();
                const topics = chapterData.topics || [];
                if (!topics.includes(row.topic)) {
                    errors.push(`Row ${index + 1}: Topic "${row.topic}" not found in chapter "${row.chapter}"`);
                }
            }
        } catch (error) {
            errors.push(`Row ${index + 1}: Error verifying chapter existence`);
        }
    }

    // Check for duplicate questions
    let isDuplicate = false;
    if (errors.length === 0 && row.text && row.subject) {
        try {
            const duplicateQuery = query(
                collection(db, 'questions'),
                where('text', '==', row.text.trim()),
                where('subject', '==', row.subject.trim())
            );
            const snapshot = await getDocs(duplicateQuery);
            if (!snapshot.empty) {
                isDuplicate = true;
                errors.push(`Row ${index + 1}: Duplicate - Question already exists`);
            }
        } catch (error) {
            console.error('Error checking for duplicate questions:', error);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        isDuplicate
    };
};

// ========== BATCH UPLOADERS ==========

export const batchUploadChapters = async (
    rows: ChapterCSVRow[],
    onProgress: (progress: number, current: number, total: number) => void
): Promise<{ success: number; failed: number; skipped: number }> => {
    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
        try {
            // Check if already exists before uploading
            const duplicateQuery = query(
                collection(db, 'chapters'),
                where('name', '==', rows[i].name.trim()),
                where('subject', '==', rows[i].subject.trim())
            );
            const snapshot = await getDocs(duplicateQuery);

            if (!snapshot.empty) {
                console.log(`Skipping duplicate chapter: ${rows[i].name}`);
                skipped++;
            } else {
                const chapterData = {
                    name: rows[i].name.trim(),
                    subject: rows[i].subject.trim(),
                    unit: rows[i].unit?.trim() || '',
                    description: rows[i].description.trim(),
                    topics: rows[i].topics.split('|').map(t => t.trim()).filter(t => t),
                    difficulty: rows[i].difficulty?.trim() || 'Medium',
                    status: rows[i].status?.trim() || 'active',
                    createdAt: serverTimestamp()
                };

                await addDoc(collection(db, 'chapters'), chapterData);
                success++;
            }
        } catch (error) {
            console.error(`Error uploading chapter ${rows[i].name}:`, error);
            failed++;
        }

        onProgress(((i + 1) / rows.length) * 100, i + 1, rows.length);
    }

    return { success, failed, skipped };
};

export const batchUploadQuestions = async (
    rows: QuestionCSVRow[],
    onProgress: (progress: number, current: number, total: number) => void
): Promise<{ success: number; failed: number; skipped: number }> => {
    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
        try {
            // Check if already exists before uploading
            const duplicateQuery = query(
                collection(db, 'questions'),
                where('text', '==', rows[i].text.trim()),
                where('subject', '==', rows[i].subject.trim())
            );
            const snapshot = await getDocs(duplicateQuery);

            if (!snapshot.empty) {
                console.log(`Skipping duplicate question`);
                skipped++;
            } else {
                const questionData: any = {
                    text: rows[i].text.trim(),
                    subject: rows[i].subject.trim(),
                    chapter: rows[i].chapter.trim(),
                    topic: rows[i].topic.trim(),
                    type: rows[i].type.trim(),
                    difficulty: rows[i].difficulty.trim(),
                    marks: Number(rows[i].marks),
                    negativeMarks: rows[i].negativeMarks ? Number(rows[i].negativeMarks) : (rows[i].type === 'MCQ' ? -1 : 0),
                    explanation: rows[i].explanation?.trim() || '',
                    createdAt: serverTimestamp()
                };

                if (rows[i].type === 'MCQ') {
                    questionData.options = [
                        rows[i].optionA.trim(),
                        rows[i].optionB.trim(),
                        rows[i].optionC.trim(),
                        rows[i].optionD.trim()
                    ];
                    questionData.correctAnswer = Number(rows[i].correctAnswer);
                } else {
                    questionData.options = [];
                    questionData.correctAnswer = rows[i].correctAnswer.trim();
                }

                await addDoc(collection(db, 'questions'), questionData);
                success++;
            }
        } catch (error) {
            console.error(`Error uploading question:`, error);
            failed++;
        }

        onProgress(((i + 1) / rows.length) * 100, i + 1, rows.length);
    }

    return { success, failed, skipped };
};

// ========== DOWNLOAD TEMPLATE ==========

export const downloadTemplate = (type: 'chapters' | 'questions') => {
    const url = `/templates/${type}_template.csv`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
