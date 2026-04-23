
import { db } from './src/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function checkCounts() {
    try {
        const series = await getDocs(query(collection(db, 'testSeries'), limit(5)));
        console.log('Test Series Count (First 5):', series.size);
        series.docs.forEach(doc => console.log('Series:', doc.id, doc.data().status, doc.data().name));

        const pyqs = await getDocs(query(collection(db, 'pyqs'), limit(5)));
        console.log('PYQs Count (First 5):', pyqs.size);
        pyqs.docs.forEach(doc => console.log('PYQ:', doc.id, doc.data().title));
    } catch (e) {
        console.error('Error:', e);
    }
}

// Note: This won't run directly via node because of imports/firebase config
// But I can use it to understand the structure.
