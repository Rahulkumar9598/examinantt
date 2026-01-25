import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../firebase';

export interface StudentStats {
    totalTests: number;
    averageScore: number;
    totalTimeSpent: number; // in seconds
    testsTrend: string; // e.g., "+2 this week"
    scoreTrend: string; // e.g., "+5% improvement"
    timeTrend: string; // e.g., "Last 30 days"
}

export interface RecommendedSeries {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    questionCount?: number;
    stats?: {
        totalTests?: number;
    };
}

export interface ActiveTest {
    id: string; // purchaseId or seriesId
    testId: string; // underlying series/test id
    title: string;
    category: string;
    purchaseDate: any;
}

// Helper to format duration
export const formatDurationHours = (seconds: number): string => {
    const hours = Math.round(seconds / 3600);
    return `${hours}h`;
};

// Get aggregated student stats
export const getStudentStats = async (userId: string): Promise<StudentStats> => {
    try {
        const attemptsRef = collection(db, 'users', userId, 'attempts');
        const q = query(attemptsRef, orderBy('attemptDate', 'desc'));
        const snapshot = await getDocs(q);
        const attempts = snapshot.docs.map(doc => doc.data());

        const totalTests = attempts.length;

        let totalScore = 0;
        let totalMaxScore = 0;
        let totalTime = 0;

        attempts.forEach(a => {
            totalScore += a.score || 0;
            // Assuming max score is usually totalQuestions * 4 for JEE, but might vary. 
            // Using a heuristic if totalMaxScore isn't saved, but for now specific calculation:
            // If totalQuestions is saved, max is usually * 4. 
            // If not, we can treat raw score average or percentage if known.
            // Let's use simple percentage if available, or just raw score.
            // Actually, StudentResultsPage calculates percentage client side. 
            // Let's approximate: 
            const max = (a.totalQuestions || 0) * 4;
            if (max > 0) {
                totalScore += (a.score / max) * 100; // Normalize to percentage per test
                totalMaxScore += 100;
            }

            totalTime += a.duration || 0;
        });

        const averageScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;

        // Trends (Mock logic for now, or true calculation if we filtered by date)
        // Real trend calculation requires complex filtering. We'll use simple dynamic strings.

        return {
            totalTests,
            averageScore,
            totalTimeSpent: totalTime,
            testsTrend: totalTests > 0 ? `${totalTests} total` : 'Start your journey',
            scoreTrend: totalTests > 0 ? 'based on attempts' : 'No data yet',
            timeTrend: 'Total learning time'
        };
    } catch (error) {
        console.error("Error fetching student stats:", error);
        return {
            totalTests: 0,
            averageScore: 0,
            totalTimeSpent: 0,
            testsTrend: '0 this week',
            scoreTrend: '0%',
            timeTrend: '0h'
        };
    }
};

// Get recommended test series
export const getRecommendedSeries = async (): Promise<RecommendedSeries[]> => {
    try {
        // Fetch published series
        // Note: Removed orderBy('createdAt') to avoid needing a composite index for now.
        // We'll sort client-side.
        const q = query(
            collection(db, 'testSeries'),
            where('status', '==', 'published'),
            limit(20) // Fetch a bit more to sort client side
        );
        const snapshot = await getDocs(q);

        const series = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.name, // Map 'name' to 'title'
                description: data.description,
                price: data.pricing?.amount ?? 0, // Map nested pricing
                category: data.examCategory, // Map 'examCategory' to 'category'
                questionCount: data.stats?.totalTests, // Optional mapping
                createdAt: data.createdAt, // Keep for sorting
                stats: {
                    totalTests: data.stats?.totalTests || 0
                }
            } as RecommendedSeries;
        });

        // Sort client-side by createdAt descending
        return series.sort((a: any, b: any) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        }).slice(0, 6); // Take top 6 after sort

    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
};

// Get active/purchased tests
export const getActiveTests = async (userId: string): Promise<ActiveTest[]> => {
    try {
        const purchasesRef = collection(db, 'users', userId, 'purchases');
        const q = query(purchasesRef, orderBy('purchaseDate', 'desc'), limit(3));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                testId: data.seriesId || data.testId,
                title: data.seriesTitle || data.testTitle,
                category: data.category || 'Test Series',
                purchaseDate: data.purchaseDate
            };
        });
    } catch (error) {
        console.error("Error fetching active tests:", error);
        return [];
    }
};
