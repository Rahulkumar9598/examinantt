# Quick Start: Import JEE Mains Data

## Problem
You're trying to import questions but getting validation errors because the chapters don't exist yet.

## Solution: Import in the Correct Order

### Step 1: Import Chapters First ✅

1. Go to **Admin Dashboard → Chapters**
2. Click green **"Template"** button to download `chapters_template.csv`
3. Click purple **"Import CSV"** button
4. Upload the template file
5. Import the 3 sample chapters

**OR** use the comprehensive seed data:

#### Option A: Manual Import (Recommended)
1. Open `scripts/seedData.json` 
2. Copy chapters data
3. Manually create a few chapters using "Create Chapter" button
4. Then import questions

#### Option B: Script Import
```bash
cd scripts
npx tsx uploadSeedData.ts
```
**Note:** Requires Firestore rules to allow write access temporarily

### Step 2: Import Questions ✅

1. Go to **Admin Dashboard → Question Bank**  
2. Click green **"Template"** button
3. Click purple **"Import CSV"** button
4. Upload the template
5. Import questions (validation will confirm chapters exist!)

---

## CSV Templates

### Chapters Template
Located: `public/templates/chapters_template.csv`

Contains 3 sample chapters:
- Laws of Motion (Physics)
- Electric Charges and Fields (Physics)
- Chemical Bonding (Chemistry)

### Questions Template  
Located: `public/templates/questions_template.csv`

Contains 4 sample questions:
- 2 Physics MCQ questions
- 1 Chemistry MCQ question
- 1 Mathematics MCQ question

**IMPORTANT:** Questions reference specific chapters, so import chapters first!

---

## Full JEE Mains Data

Located: `scripts/seedData.json`

Contains:
- **82 comprehensive chapters**
- **30 sample questions**

To import all data:

### Method 1: Use Admin Panel (Safest)
1. Open `seedData.json`
2. Copy chapters array
3. Create CSV from JSON
4. Import via admin panel

### Method 2: Direct Script Upload
1. Update Firestore rules to allow writes
2. Run `cd scripts && npx tsx uploadSeedData.ts`
3. Restore Firestore rules

---

## Quick Fix for Current Error

The error you're seeing means:
- You're uploading questions CSV
- But chapters "Laws of Motion", "Structure of Atom", etc. don't exist yet

**Fix:**
1. First go to Chapters page
2. Import chapters template
3. Then come back and import questions

This will work because validation checks if chapters exist!

---

## Need Help?

Qcheck the walkthrough for complete details:
`/Users/dineshkumar/.gemini/antigravity/brain/7f0354be-7c3a-477d-bfb2-2ffc64ecfb15/walkthrough.md`
