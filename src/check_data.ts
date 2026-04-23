import { db } from './src/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function checkCollections() {
    try {
        const pyqsSnap = await getDocs(collection(db, 'pyqs'));
        console.log(`PYQs count: ${pyqsSnap.size}`);
        pyqsSnap.docs.forEach(doc => {
            console.log(`ID: ${doc.id}`, doc.data());
        });

        const seriesSnap = await getDocs(collection(db, 'testSeries'));
        console.log(`TestSeries count: ${seriesSnap.size}`);

        const testsSnap = await getDocs(collection(db, 'tests'));
        console.log(`Tests count: ${testsSnap.size}`);
    } catch (e) {
        console.error("Error checking collections:", e);
    }
}

checkCollections();
