require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

let bot;
if (token && token !== "your_telegram_bot_token") {
    // polling: false because we only want to send messages out (for now)
    bot = new TelegramBot(token, { polling: false });
}

/**
 * Sends a Telegram message when a recruiter reaches out
 * @param {string} recruiterName - Name of the recruiter
 * @param {string} platform - "LinkedIn", "Naukri", or "Gmail"
 * @param {string} messagePreview - A snippet of what they sent
 * @param {string} messageUrl - Direct URL to the message/inbox
 */
const sendRecruiterAlert = async (recruiterName, platform, messagePreview, messageUrl) => {
    const linkText = messageUrl ? `\n\n🔗 [Click here to reply](${messageUrl})` : '';
    const text = `🚨 *New Recruiter Alert!*\n\n👤 *From:* ${recruiterName}\n🌐 *Platform:* ${platform}\n\n💬 *Message:* "${messagePreview}"${linkText}\n\n_Sent by AI Job Assistant_`;
    
    // 1. Log the alert to Supabase
    try {
        await db.query(
            "INSERT INTO ai_logs (type, message) VALUES ($1, $2)",
            ['RECRUITER_MESSAGE', text]
        );
        console.log(`✅ Alert logged in database: Recruiter ${recruiterName} via ${platform}`);
    } catch (dbErr) {
        console.error("Failed to log alert to Supabase:", dbErr);
    }

    // 2. Send via Telegram
    if (!bot || !chatId) {
        console.log("\n[MOCK TELEGRAM MESSAGE] -> Because Chat ID is not set yet.");
        console.log(text);
        console.log("------------------------------------------\n");
        return;
    }

    try {
        await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
        console.log(`✅ Telegram alert sent successfully!`);
    } catch (twErr) {
        console.error("❌ Failed to send Telegram message:", twErr.message);
    }
};

module.exports = {
    sendRecruiterAlert
};
