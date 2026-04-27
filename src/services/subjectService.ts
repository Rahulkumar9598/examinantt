import { db } from '../firebase';
import { collection, doc, query, orderBy, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export interface SubjectRecord {
    id: string;
    name: string;
    createdAt?: any;
    updatedAt?: any;
}

export const DEFAULT_SUBJECTS: string[] = [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'General Intelligence & Reasoning',
    'General Awarencess',
    'Quantitative Aptitude ',
    'English Comprehension'
];

const subjectsCollection = collection(db, 'subjects');

export const subjectService = {
    subscribe: (onUpdate: (subjects: SubjectRecord[]) => void) => {
        const subjectsQuery = query(subjectsCollection, orderBy('name', 'asc'));
        return onSnapshot(subjectsQuery, (snapshot) => {
            const loadedSubjects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SubjectRecord[];
            onUpdate(loadedSubjects);
        });
    },

    getAll: async (): Promise<SubjectRecord[]> => {
        const subjectsQuery = query(subjectsCollection, orderBy('name', 'asc'));
        const snapshot = await getDocs(subjectsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as SubjectRecord[];
    },

    create: async (name: string) => {
        await addDoc(subjectsCollection, {
            name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    },

    update: async (id: string, name: string) => {
        const subjectRef = doc(subjectsCollection, id);
        await updateDoc(subjectRef, {
            name,
            updatedAt: serverTimestamp()
        });
    },

    delete: async (id: string) => {
        const subjectRef = doc(subjectsCollection, id);
        await deleteDoc(subjectRef);
    }
};
