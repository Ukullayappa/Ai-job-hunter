require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Basic routes for testing
app.get('/api/status', (req, res) => {
    res.json({ status: 'Online', message: 'AI Job Assistant Backend is connected to Supabase.' });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
