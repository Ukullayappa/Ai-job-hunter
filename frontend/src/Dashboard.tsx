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
  cover_letter?: string;
  interview_questions?: string;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ scraped: 0, applied: 0 });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Fetch Jobs
    fetch(`${API_URL}/api/jobs`)
      .then(res => res.json())
      .then(data => {
        // Map database snake_case to frontend camelCase
        const mappedJobs = data.map((j: any) => ({
          ...j,
          matchScore: j.match_score,
          aiSummary: j.ai_summary
        }));
        setJobs(mappedJobs);
      })
      .catch(err => console.error("Error fetching jobs:", err));

    // Fetch Stats
    fetch(`${API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));
  }, [API_URL]);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.job) {
        setJobs(jobs.map(j => j.id === id ? data.job : j));
      } else {
        setJobs(jobs.map(j => j.id === id ? { ...j, status: 'APPROVED' } : j));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setApprovingId(null);
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
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans text-slate-900">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Career Hub
          </h1>
          <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-base">Automated applying, stealth scraping, & instant alerts.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 glass-card px-4 py-2 text-sm text-green-600 font-medium">
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
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold border border-slate-200 uppercase tracking-wider text-slate-600">
                      {job.platform}
                    </span>
                    <span className="text-sm text-slate-400">2 hours ago</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                  <p className="text-primary font-semibold">{job.company}</p>
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
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm leading-relaxed text-slate-600">
                <p><span className="font-semibold text-accent">AI Summary:</span> {job.aiSummary}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button onClick={() => handleApprove(job.id)} disabled={approvingId === job.id} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
                  {approvingId === job.id ? (
                    <span className="animate-pulse">Generating Pro Kit...</span>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> Approve & Apply</>
                  )}
                </button>
                <button onClick={() => handleReject(job.id)} className="flex-1 btn-secondary flex items-center justify-center gap-2 hover:bg-red-50 hover:text-white hover:border-red-100">
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>
            </div>
          ))}

          {jobs.filter(j => j.status === 'APPROVED').map((job) => (
            <div key={job.id} className="glass-card p-6 border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  <p className="text-primary text-sm font-medium">{job.company}</p>
                </div>
                <button onClick={() => setSelectedJob(job)} className="w-full sm:w-auto px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all">
                  VIEW PRO KIT
                </button>
              </div>
            </div>
          ))}

          {jobs.filter(j => j.status === 'PENDING_APPROVAL').length === 0 && jobs.filter(j => j.status === 'APPROVED').length === 0 && (
             <div className="glass-card p-12 text-center text-gray-400">
                <p>You're all caught up! The AI is hunting for more jobs.</p>
             </div>
          )}
        </div>

        {/* Sidebar: Status & Notifications */}
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-4">
             <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-slate-900">System Active</p>
                  <p className="text-xs text-slate-500 mt-1">Bot is monitoring LinkedIn & Naukri...</p>
                </div>
             </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-6 text-slate-900">Stats</h2>
          <div className="grid grid-cols-2 gap-4">
             <div className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stats.scraped}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Jobs Scraped</p>
             </div>
             <div className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-accent">{stats.applied}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Approved</p>
             </div>
          </div>
        </div>
      </div>
      {/* PRO KIT MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <XCircle className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Application Pro Kit
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> AI Cover Letter
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedJob.cover_letter || "Generating..."}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedJob.cover_letter || "");
                    alert("Copied to clipboard!");
                  }}
                  className="mt-3 text-xs text-primary font-bold hover:underline"
                >
                  COPY COVER LETTER
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Interview Prep
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedJob.interview_questions || "Analyzing interview patterns..."}
                </div>
              </div>
              
              <a href={selectedJob.url} target="_blank" rel="noreferrer" className="block w-full btn-primary text-center">
                Go Apply Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
