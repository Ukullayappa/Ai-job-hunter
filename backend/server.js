require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const { startJobHunt } = require('./scraper');

const app = express();
app.use(cors());
app.use(express.json());

// Basic routes for testing
app.get('/api/status', (req, res) => {
    res.json({ status: 'Online', message: 'AI Job Assistant Backend is connected to Supabase.' });
});

// TRIGGER THE SCRAPER MANUALLY
app.get('/api/hunt', async (req, res) => {
    // We run it in the background so the request doesn't timeout
    startJobHunt();
    res.json({ message: '🚀 Scraper started in the background! Check your Telegram for updates soon.' });
});

// Fetch all jobs from Supabase
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM ai_jobs ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Approve a job
app.post('/api/jobs/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            "UPDATE ai_jobs SET status = 'APPROVED' WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rowCount > 0) {
            res.json({ success: true, job: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Job not found' });
        }
    } catch (err) {
        console.error('Error approving job:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Reject a job
app.post('/api/jobs/:id/reject', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            "UPDATE ai_jobs SET status = 'REJECTED' WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rowCount > 0) {
            res.json({ success: true, job: result.rows[0] });
        } else {
            res.status(404).json({ error: 'Job not found' });
        }
    } catch (err) {
        console.error('Error rejecting job:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get real stats for the dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const totalResult = await db.query('SELECT COUNT(*) FROM ai_jobs');
        const approvedResult = await db.query("SELECT COUNT(*) FROM ai_jobs WHERE status = 'APPROVED'");
        res.json({
            scraped: totalResult.rows[0].count,
            applied: approvedResult.rows[0].count
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
