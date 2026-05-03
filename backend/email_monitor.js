require('dotenv').config();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const { sendRecruiterAlert } = require('./notifier');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD;

// Keywords to look for in the subject line to identify job-related emails
const RECRUITER_KEYWORDS = ['interview', 'application', 'hiring', 'recruiter', 'job', 'offer', 'assessment', 'career', 'opportunity', 'talent'];

const startEmailMonitor = async () => {
    if (!EMAIL_USER || !EMAIL_PASS) {
        console.log("⚠️ Email Monitor skipped: EMAIL_USER or EMAIL_APP_PASSWORD not set in environment variables.");
        return;
    }

    const config = {
        imap: {
            user: EMAIL_USER,
            password: EMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 10000,
            tlsOptions: { rejectUnauthorized: false }
        }
    };

    try {
        console.log("📧 Connecting to Gmail...");
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        console.log("✅ Connected to Gmail INBOX. Checking for new job emails every 5 minutes...");

        // Polling every 5 minutes to avoid IMAP IDLE disconnects on cloud servers
        setInterval(async () => {
            try {
                // Fetch unread emails
                const searchCriteria = ['UNSEEN'];
                const fetchOptions = {
                    bodies: [''],
                    markSeen: false // Don't mark as read immediately, let the user read it in Gmail
                };

                const messages = await connection.search(searchCriteria, fetchOptions);
                
                for (let item of messages) {
                    const all = item.parts.find(part => part.which === '');
                    if (!all) continue;

                    const parsed = await simpleParser(all.body);
                    
                    const subject = parsed.subject || '';
                    const from = parsed.from ? parsed.from.text : '';
                    
                    const lowerSubject = subject.toLowerCase();
                    const isRecruiterEmail = RECRUITER_KEYWORDS.some(kw => lowerSubject.includes(kw));

                    // Check if it's a recruiter and not a standard no-reply automated email
                    if (isRecruiterEmail && !from.toLowerCase().includes("no-reply") && !from.toLowerCase().includes("noreply")) {
                        console.log(`📬 Found relevant job email: ${subject}`);
                        
                        let textBody = parsed.text || "No text body available.";
                        let preview = textBody.substring(0, 150).replace(/\n/g, ' ') + '...';
                        
                        await sendRecruiterAlert(
                            from,
                            "Gmail",
                            `Subject: ${subject}\n\n${preview}`,
                            "https://mail.google.com" // Direct them to their inbox
                        );

                        // Now mark it as seen so we don't alert them again about the same email
                        await connection.addFlags(item.attributes.uid, ['\\Seen']);
                    }
                }
            } catch (err) {
                console.error("Error checking emails:", err);
            }
        }, 5 * 60 * 1000); // 5 minutes

    } catch (error) {
        console.error("❌ Failed to connect to Gmail IMAP. Check your App Password.", error.message);
    }
};

module.exports = { startEmailMonitor };
