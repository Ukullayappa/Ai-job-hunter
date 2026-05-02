const db = require('./db');

const createTables = async () => {
  try {
    console.log('Connecting to Supabase...');

    // Create ai_jobs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        url TEXT UNIQUE NOT NULL,
        match_score INTEGER,
        status VARCHAR(50) DEFAULT 'PENDING_APPROVAL',
        ai_summary TEXT,
        posted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table "ai_jobs" created successfully.');

    // Create ai_logs table for notifications/errors
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table "ai_logs" created successfully.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
