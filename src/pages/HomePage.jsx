import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import jobService from '../services/jobService';

const HomePage = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    appliedJobs: 0,
    followUpJobs: 0,
    interviewJobs: 0,
    offerJobs: 0,
    acceptedJobs: 0,
    rejectedJobs: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await jobService.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      <div className="card">
        <h1>Welcome to JobLog</h1>
        <p>
          Track your job applications and stay organized throughout your job search journey.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/jobs" className="btn btn-primary">
            View My Jobs
          </Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalJobs}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.appliedJobs}</div>
          <div className="stat-label">Applied</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.followUpJobs}</div>
          <div className="stat-label">Follow Up</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.interviewJobs}</div>
          <div className="stat-label">Interviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.offerJobs}</div>
          <div className="stat-label">Offers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.acceptedJobs}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.rejectedJobs}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;