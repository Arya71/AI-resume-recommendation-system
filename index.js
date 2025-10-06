// index.js (Complete and Corrected)

import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Imports for file handling
import multer from 'multer';
import mammoth from 'mammoth';

// Fix for pdf-parse import
const require = createRequire(import.meta.url);
const pdfParser = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Multer setup for temporary file storage
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const groq = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});


// PROMPT 1: For handling structured profiles from data.json
// PROMPT 1: For handling structured profiles from data.json
function getMasterPromptForProfile(studentProfile, jobListings) {
    return `
**Role:** You are "Synapse," an AI Career Advisor.
**Context:** You have a student's profile and a list of jobs.
**Student Profile:**
'''json
${JSON.stringify(studentProfile, null, 2)}
'''
**Job Listings:**
'''json
${JSON.stringify(jobListings, null, 2)}
'''
**Task:** Generate a single JSON object with three job recommendations. For each recommendation, you MUST provide a 'role', 'company', and a concise 'reason' (under 25 words).
1.  'direct_match': The best job based on current skills.
2.  'aspirational_match': A challenging next step. Include a 'skill_gap' array.
3.  'hidden_gem_match': A good culture fit.

**Output Format:** You MUST respond with ONLY a valid JSON object like this example:
'''json
{
  "direct_match": { "role": "Example Role", "company": "Example Inc.", "reason": "This is the reason for the match." },
  "aspirational_match": { "role": "Example Role", "company": "Example Inc.", "reason": "This is the reason.", "skill_gap": ["Example Skill"] },
  "hidden_gem_match": { "role": "Example Role", "company": "Example Inc.", "reason": "This is the reason." }
}
'''
    `;
}

// PROMPT 2: For handling raw resume text
// PROMPT 2: For handling raw resume text
function getMasterPromptForResume(resumeText, jobListings) {
    return `
**Role:** You are "Synapse," an AI hiring agent.
**Context:** You have raw resume text and a list of jobs. First, identify the candidate's skills, then generate recommendations.
**Resume Text:**
'''
${resumeText}
'''
**Job Listings:**
'''json
${JSON.stringify(jobListings, null, 2)}
'''
**Task:** Generate a single JSON object with three job recommendations. For each recommendation, you MUST provide a 'role', 'company', and a concise 'reason' (under 25 words) based on the resume.
1.  'direct_match': The best job based on skills found in the resume.
2.  'aspirational_match': A challenging next step. Include a 'skill_gap' array.
3.  'hidden_gem_match': A good culture fit based on the resume's tone.

**Output Format:** You MUST respond with ONLY a valid JSON object like this example:
'''json
{
  "direct_match": { "role": "Example Role", "company": "Example Inc.", "reason": "This is the reason for the match." },
  "aspirational_match": { "role": "Example Role", "company": "Example Inc.", "reason": "This is the reason.", "skill_gap": ["Example Skill"] },
  "hidden_gem_match": { "role": "Example Role", "company": "Example Inc.", "reason": "This is the reason." }
}
'''
    `;
}

const databasePath = path.join(__dirname, 'data.json');

// ROUTE 1: The Homepage
app.get('/', (req, res) => {
    const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
    res.render('index', { students: database.students });
});

// ROUTE 2: Handle Resume Upload
// index.js

// ... (keep all the code at the top of your file the same) ...

// UPDATED ROUTE: Handle Resume Upload with better error logging
app.post('/upload', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        let resumeText = '';
        // Check file type and parse accordingly
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdfParser(dataBuffer);
            resumeText = data.text;
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: req.file.path });
            resumeText = result.value;
        } else {
            fs.unlinkSync(req.file.path);
            return res.status(400).send('Unsupported file type. Please upload a PDF or DOCX.');
        }
        
        fs.unlinkSync(req.file.path);

        // Now, use this text to get recommendations
        const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        const jobs = database.jobs.filter(j => j.active).slice(0, 20); // Limit to 20 jobs        
        console.log(`🧠 Parsing uploaded resume and generating recommendations...`);
        const masterPrompt = getMasterPromptForResume(resumeText, jobs);

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: masterPrompt }],
            response_format: { type: "json_object" },
        });

        const recommendations = JSON.parse(response.choices[0].message.content);

        const studentFromResume = { name: "Uploaded Resume", skills: ["Extracted from document"] };
        res.render('recommendations', { student: studentFromResume, recommendations: recommendations });

    } catch (error) {
        // THIS IS THE UPDATED PART
        console.error("❌ DETAILED UPLOAD ERROR:", error); // Log the full error to the terminal
        res.status(500).send(`An error occurred while processing the resume. Please check the terminal for details.`);
    }
});


// ROUTE 3: Handle Existing Profiles
app.get('/recommend/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        
        const student = database.students.find(s => s._id === studentId);
        const jobs = database.jobs.filter(j => j.active).slice(0, 20); // Limit to 20 jobs
        if (!student) {
            return res.status(404).send("Student not found");
        }
        
        console.log(`🧠 Generating recommendations for ${student.name}...`);
        const masterPrompt = getMasterPromptForProfile(student, jobs);

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: masterPrompt }],
            response_format: { type: "json_object" },
        });
        const recommendations = JSON.parse(response.choices[0].message.content);

        res.render('recommendations', { student: student, recommendations: recommendations });

    } catch (error) {
        console.error("❌ An error occurred:", error);
        res.status(500).send("An error occurred while generating recommendations.");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});