import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AddJobPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    customCompany: ''
  });

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
      navigate('/jobs', { 
        state: { message: 'Job application added successfully!' }
      });
    } catch (error) {
      console.error('Error adding job:', error);
      alert('Failed to add job application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h1>Add Job Application</h1>
        <p>Track a new job application. It will be automatically marked as "Applied" with today's date.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
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
            <div className="form-group">
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

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Adding...' : 'Add Job Application'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobPage;