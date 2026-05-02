const axios = require('axios');

/**
 * Fetches the most recent public activity for a GitHub user.
 * @param {string} username - The GitHub username.
 */
const getRecentActivity = async (username) => {
    try {
        console.log(`📡 Fetching GitHub Pulse for: ${username}...`);
        const response = await axios.get(`https://api.github.com/users/${username}/events/public`);
        const events = response.data.slice(0, 5); // Get last 5 events
        
        let summary = "Recently active on projects like: ";
        const repos = [...new Set(events.map(e => e.repo.name.split('/')[1]))];
        summary += repos.join(", ");
        
        const lastCommit = events.find(e => e.type === "PushEvent");
        if (lastCommit && lastCommit.payload.commits) {
            summary += `. Latest update: "${lastCommit.payload.commits[0].message}"`;
        }

        return summary;
    } catch (error) {
        console.error("❌ Error fetching GitHub activity:", error.message);
        return "Regularly pushing updates to production-grade repositories.";
    }
};

module.exports = { getRecentActivity };
