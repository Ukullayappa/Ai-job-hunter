require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { evaluateJobMatch } = require('./ai_matcher');
const { sendRecruiterAlert } = require('./notifier');
const db = require('./db');

puppeteer.use(StealthPlugin());

const SEARCH_QUERIES = [
    'site:*.com/careers "Software Engineer" fresher Bangalore 2026',
    'site:*.com/careers "Full Stack Developer" junior Hyderabad 2026',
    'site:*.com/careers "Backend Developer" fresher Remote 2026'
];

/**
 * Main function to start the job hunt
 */
const startJobHunt = async () => {
    console.log("🚀 Starting the Global Job Hunt...");
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    for (const query of SEARCH_QUERIES) {
        console.log(`\n🔍 Searching: ${query}`);
        try {
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
            
            // Extract job links from search results
            const results = await page.evaluate(() => {
                const links = [];
                const searchItems = document.querySelectorAll('div.g');
                searchItems.forEach(item => {
                    const title = item.querySelector('h3')?.innerText;
                    const url = item.querySelector('a')?.href;
                    if (title && url && !url.includes('google.com')) {
                        links.push({ title, url });
                    }
                });
                return links;
            });

            console.log(`✅ Found ${results.length} potential leads.`);

            for (const res of results) {
                // For a real app, we would visit the link and scrape the full description.
                // For this version, we use the title and a snippet for AI evaluation.
                console.log(`\n🧠 AI evaluating: ${res.title}`);
                
                const match = await evaluateJobMatch(res.title, `This is a job posting for ${res.title} found at ${res.url}. It appears to be a fresher-level IT role.`);
                
                if (match.score >= 60) {
                    console.log(`🔥 HIGH MATCH FOUND (${match.score}%)! Notifying user...`);
                    
                    // 1. Save to Supabase
                    await db.query(
                        "INSERT INTO ai_jobs (title, company, location, platform, match_score, status, url) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (url) DO NOTHING",
                        [res.title, "Unknown Company", "Bangalore/Hyd", "Web Search", match.score, 'PENDING', res.url]
                    );

                    // 2. Send Telegram Notification
                    await sendRecruiterAlert(
                        "Job Bot", 
                        "Web Search", 
                        `Found a ${match.score}% match: ${res.title}. ${match.summary}`,
                        res.url
                    );
                } else {
                    console.log(`⏩ Low match (${match.score}%). Skipping.`);
                }
            }

        } catch (err) {
            console.error(`❌ Error during search: ${err.message}`);
        }
    }

    await browser.close();
    console.log("\n🏁 Job hunt session complete.");
};

if (require.main === module) {
    startJobHunt();
}

module.exports = { startJobHunt };
