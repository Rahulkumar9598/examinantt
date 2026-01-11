import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase configuration - same as in your app
const firebaseConfig = {
    apiKey: "AIzaSyD7KvJBN7IqG4g6pzE5Y1rHeFaYF2hvGEc",
    authDomain: "examinant-92c23.firebaseapp.com",
    projectId: "examinant-92c23",
    storageBucket: "examinant-92c23.firebasestorage.app",
    messagingSenderId: "764046336877",
    appId: "1:764046336877:web:1f8cfabf3bf4e7a59bee96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Chapter {
    name: string;
    subject: string;
    unit: string;
    description: string;
    topics: string[];
    difficulty: string;
    status: string;
}

interface Question {
    text: string;
    subject: string;
    chapter: string;
    topic: string;
    type: string;
    difficulty: string;
    marks: number;
    negativeMarks: number;
    options: string[];
    correctAnswer: number | string;
    explanation: string;
}

interface SeedData {
    chapters: Chapter[];
    questions: Question[];
}

async function uploadSeedData() {
    try {
        // Read seed data file - use simple relative path
        const seedDataRaw = fs.readFileSync('seedData.json', 'utf-8');
        const seedData: SeedData = JSON.parse(seedDataRaw);

        console.log('📚 Starting seed data upload...\n');
        console.log(`Total Chapters: ${seedData.chapters.length}`);
        console.log(`Total Questions: ${seedData.questions.length}\n`);

        // Upload Chapters
        console.log('Uploading chapters...');
        let chaptersUploaded = 0;

        for (const chapter of seedData.chapters) {
            try {
                await addDoc(collection(db, 'chapters'), {
                    ...chapter,
                    createdAt: serverTimestamp()
                });
                chaptersUploaded++;

                // Progress indicator
                if (chaptersUploaded % 10 === 0) {
                    console.log(`  ✅ Uploaded ${chaptersUploaded}/${seedData.chapters.length} chapters`);
                }
            } catch (error) {
                console.error(`  ❌ Error uploading chapter ${chapter.name}:`, error);
            }
        }

        console.log(`\n✅ Successfully uploaded ${chaptersUploaded}/${seedData.chapters.length} chapters\n`);

        // Upload Questions
        console.log('Uploading questions...');
        let questionsUploaded = 0;

        for (const question of seedData.questions) {
            try {
                await addDoc(collection(db, 'questions'), {
                    ...question,
                    createdAt: serverTimestamp()
                });
                questionsUploaded++;

                // Progress indicator
                if (questionsUploaded % 5 === 0) {
                    console.log(`  ✅ Uploaded ${questionsUploaded}/${seedData.questions.length} questions`);
                }
            } catch (error) {
                console.error(`  ❌ Error uploading question:`, error);
            }
        }

        console.log(`\n✅ Successfully uploaded ${questionsUploaded}/${seedData.questions.length} questions\n`);

        console.log('🎉 SEED DATA UPLOAD COMPLETE!');
        console.log(`\n📊 Summary:`);
        console.log(`   Chapters: ${chaptersUploaded}/${seedData.chapters.length}`);
        console.log(`   Questions: ${questionsUploaded}/${seedData.questions.length}`);
        console.log(`\n✨ Your database is ready with JEE Mains content!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during seed data upload:', error);
        process.exit(1);
    }
}

// Run the upload
uploadSeedData();
