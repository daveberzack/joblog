// IndexedDB service for job application tracking with action timeline
class JobService {
  constructor() {
    this.dbName = 'JobLogDB';
    this.version = 2; // Increment version for schema change
    this.storeName = 'jobs';
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Delete old store if it exists (for clean migration)
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // Create new object store with updated structure
        const store = db.createObjectStore(this.storeName, {
          keyPath: 'id',
          autoIncrement: true
        });

        // Create indexes for better querying
        store.createIndex('company', 'company', { unique: false });
        store.createIndex('dateCreated', 'dateCreated', { unique: false });
      };
    });
  }

  // Add a new job application (always starts with 'Applied' action)
  async addJob(jobData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const now = new Date().toISOString();
      
      // Create job entry with action timeline
      const jobEntry = {
        company: jobData.company,
        dateCreated: now,
        dateModified: now,
        actions: [
          {
            id: 1,
            type: 'Applied',
            date: now,
            notes: ''
          }
        ]
      };

      const request = store.add(jobEntry);

      request.onsuccess = () => {
        resolve({ ...jobEntry, id: request.result });
      };

      request.onerror = () => {
        reject(new Error('Failed to add job entry'));
      };
    });
  }

  // Add an action to an existing job
  async addAction(jobId, actionType, notes = '') {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // First get the existing record
      const getRequest = store.get(jobId);
      
      getRequest.onsuccess = () => {
        const existingJob = getRequest.result;
        if (!existingJob) {
          reject(new Error('Job entry not found'));
          return;
        }

        // Add new action to the timeline
        const newAction = {
          id: existingJob.actions.length + 1,
          type: actionType,
          date: new Date().toISOString(),
          notes: notes
        };

        const updatedJob = {
          ...existingJob,
          actions: [...existingJob.actions, newAction],
          dateModified: new Date().toISOString()
        };

        const putRequest = store.put(updatedJob);
        
        putRequest.onsuccess = () => {
          resolve(updatedJob);
        };

        putRequest.onerror = () => {
          reject(new Error('Failed to add action to job entry'));
        };
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to retrieve job entry for action update'));
      };
    });
  }

  // Get all job applications
  async getAllJobs() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by date created (newest first)
        const jobs = request.result.sort((a, b) => 
          new Date(b.dateCreated) - new Date(a.dateCreated)
        );
        resolve(jobs);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve job entries'));
      };
    });
  }

  // Get a specific job by ID
  async getJobById(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve job entry'));
      };
    });
  }

  // Delete a job application
  async deleteJob(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error('Failed to delete job entry'));
      };
    });
  }

  // Search jobs by company name
  async searchByCompany(companyName) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const filtered = request.result.filter(job =>
          job.company.toLowerCase().includes(companyName.toLowerCase())
        );
        resolve(filtered);
      };

      request.onerror = () => {
        reject(new Error('Failed to search jobs by company'));
      };
    });
  }

  // Get jobs by latest action type
  async getJobsByLatestAction(actionType) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const filtered = request.result.filter(job => {
          const latestAction = job.actions[job.actions.length - 1];
          return latestAction && latestAction.type === actionType;
        });
        resolve(filtered);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve jobs by latest action'));
      };
    });
  }

  // Get statistics for dashboard
  async getStats() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const jobs = request.result;
        const stats = {
          totalJobs: jobs.length,
          appliedJobs: 0,
          followUpJobs: 0,
          interviewJobs: 0,
          offerJobs: 0,
          acceptedJobs: 0,
          rejectedJobs: 0
        };

        jobs.forEach(job => {
          const latestAction = job.actions[job.actions.length - 1];
          if (latestAction) {
            switch (latestAction.type) {
              case 'Applied':
                stats.appliedJobs++;
                break;
              case 'Follow Up':
                stats.followUpJobs++;
                break;
              case 'Interview':
                stats.interviewJobs++;
                break;
              case 'Offer':
                stats.offerJobs++;
                break;
              case 'Accepted':
                stats.acceptedJobs++;
                break;
              case 'Rejected':
                stats.rejectedJobs++;
                break;
            }
          }
        });

        resolve(stats);
      };

      request.onerror = () => {
        reject(new Error('Failed to calculate statistics'));
      };
    });
  }
}

// Create and export a singleton instance
const jobService = new JobService();
export default jobService;