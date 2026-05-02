const db = require('./db');

const seedData = async () => {
    try {
        await db.query(`
            INSERT INTO ai_jobs (platform, title, company, url, match_score, ai_summary, status)
            VALUES 
            ('LinkedIn', 'Senior Frontend Developer', 'Tech Innovators Inc.', 'https://linkedin.com/jobs/view/12345', 92, 'Strong match. Your React and Tailwind experience aligns perfectly.', 'PENDING_APPROVAL'),
            ('Naukri', 'Full Stack Engineer (Node.js/React)', 'Global Solutions Ltd', 'https://naukri.com/job-listings-12345', 88, 'Good match. Node.js backend experience is highly relevant.', 'PENDING_APPROVAL')
            ON CONFLICT (url) DO NOTHING;
        `);
        console.log('✅ Seed data inserted successfully!');
    } catch (e) {
        console.error('Error seeding data:', e);
    } finally {
        process.exit(0);
    }
}
seedData();
