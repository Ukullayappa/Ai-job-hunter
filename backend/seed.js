const db = require('./db');

const seedData = async () => {
    try {
        await db.query(`
            INSERT INTO ai_jobs (platform, title, company, url, match_score, ai_summary, status)
            VALUES 
            ('LinkedIn', 'Software Engineer (Internal)', 'Cisco', 'https://www.linkedin.com/jobs/view/4214567890', 92, 'Strong match. Your React and Node.js projects align with Cisco''s cloud infrastructure needs.', 'PENDING_APPROVAL'),
            ('Naukri', 'Software Engineer', 'Cisco', 'https://www.naukri.com/job-listings-software-engineer-cisco-hyderabad-bengaluru-0-to-1-years-070426500687', 88, 'Great match for a 2026 batch fresher. The role focuses on full-stack development which fits your profile.', 'PENDING_APPROVAL'),
            ('Naukri', 'Custom Software Engineer', 'Accenture', 'https://www.naukri.com/job-listings-custom-software-engineer-accenture-solutions-pvt-ltd-gurugram-0-to-1-years-220426916755', 85, 'Accenture is looking for freshers with strong problem-solving skills. Your GitHub activity shows consistent coding pulse.', 'PENDING_APPROVAL')
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
