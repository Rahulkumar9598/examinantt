import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

export interface MarketplaceItem {
    id: string;
    title: string;
    price: number;
    type: 'testSeries' | 'pyq' | 'resource';
    [key: string]: any;
}

export const marketplaceService = {
    /**
     * Enroll a student in a marketplace item (Test Series, PYQ, or Resource)
     */
    enrollInItem: async (userId: string, item: MarketplaceItem) => {
        try {
            // 1. Check if already purchased to prevent duplicates
            const purchasesRef = collection(db, 'users', userId, 'purchases');
            const q = query(purchasesRef, where('itemId', '==', item.id));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                return { success: true, message: "Already enrolled" };
            }

            // 2. Add to student's purchases
            const purchaseData: any = {
                itemId: item.id,
                title: item.title,
                type: item.type,
                price: item.price,
                purchaseDate: serverTimestamp(),
            };

            // Add specific mappings for compatibility with various components
            if (item.type === 'testSeries') {
                purchaseData.seriesId = item.id;
                purchaseData.seriesTitle = item.title;
            } else if (item.type === 'pyq') {
                purchaseData.testId = item.id;
            }

            await addDoc(purchasesRef, purchaseData);
            return { success: true, message: "Enrolled successfully" };
        } catch (error) {
            console.error("Marketplace enrollment error:", error);
            throw error;
        }
    }
};
