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
    enrollInItem: async (userId: string, item: any) => {
        try {
            if (!userId) throw new Error("User ID is required for enrollment");
            if (!item || !item.id) throw new Error("Invalid item data for enrollment");

            const itemId = item.id;
            const purchasesRef = collection(db, 'users', userId, 'purchases');
            
            // 1. Manual check for duplicates before adding
            const q = query(purchasesRef, where('itemId', '==', itemId));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                console.log("User already enrolled in:", itemId);
                return { success: true, message: "Already enrolled" };
            }

            // 2. Prepare unified purchase data
            const purchaseData: any = {
                itemId: itemId,
                seriesId: itemId, 
                testId: itemId,   
                title: item.name || item.title || "Unnamed Item",
                seriesTitle: item.name || item.title || "Unnamed Item",
                testTitle: item.name || item.title || "Unnamed Item",
                type: item.type || (item.pricing ? 'testSeries' : 'resource'),
                price: item.pricing ? (item.pricing.type === 'free' ? 0 : item.pricing.amount) : (item.price || 0),
                category: item.examCategory || item.category || "General",
                purchaseDate: serverTimestamp(),
                status: 'active',
                createdAt: serverTimestamp()
            };

            console.log("Enrolling user:", userId, "in item:", itemId);
            await addDoc(purchasesRef, purchaseData);
            
            console.log("Enrollment successful for:", itemId);
            return { success: true, message: "Enrolled successfully" };
        } catch (error: any) {
            console.error("Marketplace enrollment error details:", error);
            throw new Error(`Enrollment failed: ${error.message || 'Unknown error'}`);
        }
    },
    
    /**
     * Process payment via Razorpay
     */
    processPayment: async (userId: string, item: any) => {
        return new Promise((resolve, reject) => {
            if (item.price === 0) {
                marketplaceService.enrollInItem(userId, item)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            const options = {
                key: 'rzp_test_placeholder', // Should be in env in real app
                amount: item.price * 100, // in paise
                currency: 'INR',
                name: 'DHItantra',
                description: `Purchase ${item.title}`,
                image: '/logo.png',
                handler: async function (response: any) {
                    try {
                        console.log("Payment Successful:", response.razorpay_payment_id);
                        const result = await marketplaceService.enrollInItem(userId, item);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                },
                prefill: {
                    name: '', // Optional: Fill from user profile
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#10B981'
                },
                modal: {
                    ondismiss: function() {
                        reject(new Error("Payment cancelled by user"));
                    }
                }
            };

            // Mock success for placeholder key to allow developer testing
            if (options.key === 'rzp_test_placeholder') {
                if (window.confirm("[DEVELOPER MODE] This is a mock payment. Click OK to simulate a successful payment for: " + item.title)) {
                    marketplaceService.enrollInItem(userId, item)
                        .then(resolve)
                        .catch(reject);
                    return;
                } else {
                    reject(new Error("Payment cancelled"));
                    return;
                }
            }

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        });
    }
};
