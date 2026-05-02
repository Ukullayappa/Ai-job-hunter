require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

/**
 * Analyzes a job description against the user's resume using AI.
 * @param {string} jobTitle - The title of the job.
 * @param {string} jobDescription - The full text of the job description.
 * @returns {Promise<{ score: number, summary: string }>}
 */
const evaluateJobMatch = async (jobTitle, jobDescription) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
            console.log("[MOCK AI MATCHER] Returning fake data because API key is missing.");
            return {
                score: Math.floor(Math.random() * 40) + 60, // random score between 60 and 100
                summary: "This is a mock AI summary. Please add your Gemini API key to see real results."
            };
        }

        // Read the user's resume
        const resumePath = path.join(__dirname, 'resume.txt');
        const userResume = fs.readFileSync(resumePath, 'utf8');

        // Prepare the prompt
        const prompt = `
        You are an expert tech recruiter and AI job matching assistant.
        I will provide you with a candidate's RESUME and a JOB DESCRIPTION for the role of "${jobTitle}".
        
        CANDIDATE CONTEXT:
        - The candidate is a FRESHER (Graduate of the 2026 batch).
        - They have NO professional work experience.
        - They are looking for their first full-time IT/Software job.
        - PREFERRED LOCATIONS: Bangalore, Hyderabad, or Remote.

        CRITICAL FILTERING RULES:
        1. STRICTLY NO INTERNSHIPS: If the job is an INTERNSHIP, give it a score of 0.
        2. IT FIELD ONLY: If the job is in a NON-IT field (e.g., Sales, Marketing, HR, Manufacturing, etc.), give it a score of 0.
        3. FRESHER FRIENDLY: Prioritize roles labeled "Entry Level", "Junior", "Graduate Trainee", or roles mentioning "2026 batch" or "0 years experience".
        4. LOCATION MATCH: Give a bonus (+10 score) if the job is in Bangalore, Hyderabad, or is Remote.
        5. If a job requires 2+ years of experience, give it a low score (< 40).

        Return ONLY a JSON object with two fields:
        1. "score": An integer from 0 to 100 representing the "Recruitment Probability Percentage" (how likely they are to get the job if they apply).
        2. "summary": A detailed AI summary explaining exactly why they have this recruitment chance, highlighting their matching skills from their resume (like React, Node, SQL) and any missing requirements.
        
        Do NOT wrap the JSON in markdown code blocks. Just output raw JSON.

        --- RESUME ---
        ${userResume}

        --- JOB DESCRIPTION ---
        ${jobDescription}
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Parse the JSON (stripping markdown if the AI accidentally added it)
        const cleanJsonStr = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        return {
            score: parsed.score,
            summary: parsed.summary
        };

    } catch (error) {
        console.error("❌ Error in AI Matcher:", error.message);
        return { score: 0, summary: "Failed to analyze job due to an AI error." };
    }
};

module.exports = { evaluateJobMatch };
