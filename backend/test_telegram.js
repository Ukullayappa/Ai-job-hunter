require('dotenv').config();
const { sendRecruiterAlert } = require('./notifier');

async function test() {
    console.log("📡 Sending test message to Telegram...");
    try {
        await sendRecruiterAlert(
            "System Test", 
            "Self-Test", 
            "🚀 Your Job Hunter Bot is 100% connected! You will receive real alerts here as soon as the AI finds a high-match job for you.",
            "https://ai-job-hunter-dashboard.vercel.app"
        );
        console.log("✅ Test message sent!");
    } catch (e) {
        console.error("❌ Failed to send test message:", e.message);
    }
}

test();
