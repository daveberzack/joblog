import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import jobService from '../services/jobService';

const COMPANIES = [
  'Google',
  'Apple',
  'Microsoft',
  'Amazon',
  'Meta',
  'Netflix',
  'Tesla',
  'Uber',
  'Airbnb',
  'Stripe',
  'Shopify',
  'Spotify',
  'Other'
];

const ACTION_TYPES = [
  'Follow Up',
  'Interview',
  'Offer',
  'Accepted',
  'Rejected'
];

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [addingAction, setAddingAction] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    customCompany: ''
  });
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setTimeout(() => setMessage(''), 5000);
    }
  }, [location]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getAllJobs();
      setJobs(jobData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const jobData = {
        company: formData.company === 'Other' ? formData.customCompany : formData.company
      };

      await jobService.addJob(jobData);
      await loadJobs();
      setFormData({ company: '', customCompany: '' });
      setMessage('Job application added successfully!');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error adding job:', error);
      alert('Failed to add job application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await jobService.deleteJob(jobId);
        await loadJobs();
        setMessage('Job application deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job application.');
      }
    }
  };

  const handleAddAction = async (jobId, actionType) => {
    try {
      await jobService.addAction(jobId, actionType);
      await loadJobs();
      setAddingAction(prev => ({ ...prev, [jobId]: '' }));
      setMessage(`Action "${actionType}" added successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding action:', error);
      alert('Failed to add action.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActionColor = (actionType) => {
    const colors = {
      'Applied': 'text-blue-600',
      'Follow Up': 'text-yellow-600',
      'Interview': 'text-green-600',
      'Offer': 'text-purple-600',
      'Accepted': 'text-green-700',
      'Rejected': 'text-red-600'
    };
    return colors[actionType] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>My Job Applications</h1>
        <p>{jobs.length} total applications</p>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* Add Job Form */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Add New Job Application</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: '0', flex: '1', minWidth: '200px' }}>
              <label htmlFor="company">Company *</label>
              <select
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleInputChange}
              >
                <option value="">Select a company</option>
                {COMPANIES.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            {formData.company === 'Other' && (
              <div className="form-group" style={{ marginBottom: '0', flex: '1', minWidth: '200px' }}>
                <label htmlFor="customCompany">Company Name *</label>
                <input
                  type="text"
                  id="customCompany"
                  name="customCompany"
                  required
                  value={formData.customCompany}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ marginBottom: '0' }}
            >
              {isSubmitting ? 'Adding...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>

      {/* Job List */}
      {jobs.length === 0 ? (
        <div className="empty-state">
          <h3>No job applications yet</h3>
          <p>Add your first job application using the form above.</p>
        </div>
      ) : (
        <div>
          {jobs.map((job) => (
            <div key={job.id} className="job-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="job-info">
                  <h3>{job.company}</h3>
                  <div className="job-meta">
                    Created on {formatDate(job.dateCreated)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#666', 
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '18px'
                  }}
                  title="Delete Job"
                >
                  ×
                </button>
              </div>

              {/* Action Timeline */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#666' }}>
                  Timeline
                </h4>
                <div style={{ paddingLeft: '16px', borderLeft: '2px solid #e5e5e5' }}>
                  {job.actions.map((action, index) => (
                    <div key={action.id} style={{ marginBottom: '8px', paddingLeft: '12px', position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', 
                        left: '-6px', 
                        top: '6px', 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#1a1a1a', 
                        borderRadius: '50%' 
                      }}></div>
                      <div style={{ fontSize: '14px' }}>
                        <span className={getActionColor(action.type)} style={{ fontWeight: '500' }}>
                          {action.type}
                        </span>
                        <span style={{ color: '#666', marginLeft: '8px' }}>
                          on {formatDate(action.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Action */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e5e5' }}>
                <select
                  value={addingAction[job.id] || ''}
                  onChange={(e) => setAddingAction(prev => ({ ...prev, [job.id]: e.target.value }))}
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #e5e5e5', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="">Select action...</option>
                  {ACTION_TYPES.map(actionType => (
                    <option key={actionType} value={actionType}>{actionType}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddAction(job.id, addingAction[job.id])}
                  disabled={!addingAction[job.id]}
                  className="btn btn-primary"
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '14px',
                    opacity: !addingAction[job.id] ? 0.5 : 1,
                    cursor: !addingAction[job.id] ? 'not-allowed' : 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListPage;