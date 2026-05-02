import { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, XCircle, Mail, MessageSquare } from 'lucide-react';

interface Job {
  id: string;
  platform: string;
  title: string;
  company: string;
  matchScore: number;
  status: string;
  aiSummary: string;
  url: string;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ scraped: 0, applied: 0 });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Fetch Jobs
    fetch(`${API_URL}/api/jobs`)
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error("Error fetching jobs:", err));

    // Fetch Stats
    fetch(`${API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));
  }, [API_URL]);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/jobs/${id}/approve`, { method: 'POST' });
      setJobs(jobs.map(j => j.id === id ? { ...j, status: 'APPROVED' } : j));
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/jobs/${id}/reject`, { method: 'POST' });
      setJobs(jobs.map(j => j.id === id ? { ...j, status: 'REJECTED' } : j));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans text-gray-100">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            AI Career Hub
          </h1>
          <p className="text-gray-400 mt-2">Automated applying, stealth scraping, & instant alerts.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 glass-card px-4 py-2 text-sm text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Stealth Bot Active
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
            <Briefcase className="w-6 h-6 text-primary" />
            Needs Your Approval
          </h2>
          
          {jobs.filter(j => j.status === 'PENDING_APPROVAL').map((job) => (
            <div key={job.id} className="glass-card p-6 flex flex-col gap-4 transform transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-surface rounded-full text-xs font-medium border border-white/5 uppercase tracking-wider text-gray-300">
                      {job.platform}
                    </span>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{job.title}</h3>
                  <p className="text-primary font-medium">{job.company}</p>
                </div>
                
                {/* Match Score */}
                <div className="relative flex flex-col items-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-surface" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                      strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - job.matchScore / 100)}
                      className={job.matchScore > 90 ? 'text-green-500' : 'text-yellow-500'} />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold">
                    {job.matchScore}%
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-background/50 rounded-lg border border-white/5 text-sm leading-relaxed text-gray-300">
                <p><span className="font-semibold text-accent">AI Summary:</span> {job.aiSummary}</p>
              </div>

              <div className="flex gap-4 mt-2">
                <button onClick={() => handleApprove(job.id)} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Approve & Apply
                </button>
                <button onClick={() => handleReject(job.id)} className="flex-1 btn-secondary flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30">
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>
            </div>
          ))}

          {jobs.filter(j => j.status === 'PENDING_APPROVAL').length === 0 && (
             <div className="glass-card p-12 text-center text-gray-400">
                <p>You're all caught up! The AI is hunting for more jobs.</p>
             </div>
          )}
        </div>

        {/* Sidebar: Status & Notifications */}
        <div className="space-y-6">
           <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
            <Mail className="w-6 h-6 text-accent" />
            Recent Alerts
          </h2>

          <div className="glass-card p-5 space-y-4">
             <div className="flex gap-3 items-start p-3 bg-white/5 rounded-lg border border-white/5">
                <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-white">System Active</p>
                  <p className="text-xs text-gray-400 mt-1">Bot is monitoring LinkedIn & Naukri...</p>
                </div>
             </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-6">Stats</h2>
          <div className="grid grid-cols-2 gap-4">
             <div className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats.scraped}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Jobs Scraped</p>
             </div>
             <div className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-accent">{stats.applied}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Approved</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
