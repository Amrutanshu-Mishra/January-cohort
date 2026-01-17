/**
 * API Service for communicating with the backend
 * All API calls include the Clerk authentication token
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/users/profile')
 * @param {object} options - Fetch options
 * @param {function} getToken - Clerk's getToken function
 */
async function apiRequest(endpoint, options = {}, getToken) {
     const token = await getToken();

     const config = {
          ...options,
          headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
               ...options.headers,
          },
     };

     const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

     if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'An error occurred' }));
          throw new Error(error.message || `HTTP error! status: ${response.status}`);
     }

     return response.json();
}

// ============ USER APIs ============

/**
 * Sync user data from Clerk to MongoDB
 */
export async function syncUser(getToken) {
     return apiRequest('/users/sync', { method: 'POST' }, getToken);
}

/**
 * Get current user profile
 */
export async function getUserProfile(getToken) {
     return apiRequest('/users/profile', { method: 'GET' }, getToken);
}

/**
 * Update user profile
 */
export async function updateUserProfile(data, getToken) {
     return apiRequest('/users/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
     }, getToken);
}

/**
 * Add a target job to user's profile
 */
export async function addTargetJob(jobData, getToken) {
     return apiRequest('/users/target-jobs', {
          method: 'POST',
          body: JSON.stringify(jobData),
     }, getToken);
}

// ============ COMPANY APIs ============

/**
 * Register a new company
 */
export async function registerCompany(companyData, getToken) {
     return apiRequest('/companies/register', {
          method: 'POST',
          body: JSON.stringify(companyData),
     }, getToken);
}

/**
 * Get company profile
 */
export async function getCompanyProfile(getToken) {
     return apiRequest('/companies/profile', { method: 'GET' }, getToken);
}

/**
 * Update company profile
 */
export async function updateCompanyProfile(data, getToken) {
     return apiRequest('/companies/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
     }, getToken);
}

// ============ JOB APIs ============

/**
 * Get all jobs
 */
export async function getJobs(getToken) {
     return apiRequest('/jobs', { method: 'GET' }, getToken);
}

/**
 * Get a specific job by ID
 */
export async function getJob(jobId, getToken) {
     return apiRequest(`/jobs/${jobId}`, { method: 'GET' }, getToken);
}

/**
 * Create a new job (company only)
 */
export async function createJob(jobData, getToken) {
     return apiRequest('/jobs', {
          method: 'POST',
          body: JSON.stringify(jobData),
     }, getToken);
}

/**
 * Update a job (company only)
 */
export async function updateJob(jobId, jobData, getToken) {
     return apiRequest(`/jobs/${jobId}`, {
          method: 'PUT',
          body: JSON.stringify(jobData),
     }, getToken);
}

/**
 * Delete a job (company only)
 */
export async function deleteJob(jobId, getToken) {
     return apiRequest(`/jobs/${jobId}`, { method: 'DELETE' }, getToken);
}

/**
 * Apply to a job
 */
export async function applyToJob(jobId, getToken) {
     return apiRequest(`/jobs/${jobId}/apply`, { method: 'POST' }, getToken);
}

// ============ COMPANY JOB MANAGEMENT APIs ============

/**
 * Get company dashboard stats
 */
export async function getCompanyStats(getToken) {
     return apiRequest('/jobs/company/stats', { method: 'GET' }, getToken);
}

/**
 * Get all applicants for all company jobs
 */
export async function getAllCompanyApplicants(getToken) {
     return apiRequest('/jobs/company/applicants', { method: 'GET' }, getToken);
}

/**
 * Get applicants for a specific job
 */
export async function getJobApplicants(jobId, getToken) {
     return apiRequest(`/jobs/${jobId}/applicants`, { method: 'GET' }, getToken);
}

/**
 * Update applicant status
 */
export async function updateApplicantStatus(jobId, applicationId, status, getToken) {
     return apiRequest(`/jobs/${jobId}/applicants/${applicationId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
     }, getToken);
}

// ============ ANALYSIS APIs ============

/**
 * Analyze user's resume (triggers AI analysis)
 */
export async function analyzeResume(getToken) {
     return apiRequest('/analysis/resume', { method: 'POST' }, getToken);
}

/**
 * Get resume analysis results (without re-running analysis)
 */
export async function getResumeAnalysis(getToken) {
     return apiRequest('/analysis/resume', { method: 'GET' }, getToken);
}

/**
 * Analyze job match for a target job
 */
export async function analyzeJobMatch(targetJobId, getToken) {
     return apiRequest(`/analysis/jobs/${targetJobId}`, { method: 'POST' }, getToken);
}

/**
 * Get job analysis results
 */
export async function getJobAnalysis(targetJobId, getToken) {
     return apiRequest(`/analysis/jobs/${targetJobId}`, { method: 'GET' }, getToken);
}

// ============ UPLOAD APIs ============

/**
 * Upload resume to S3 via backend
 * The backend handles S3 upload through multer
 */
export async function uploadResume(file, getToken) {
     const token = await getToken();

     const formData = new FormData();
     formData.append('resume', file);

     const response = await fetch(`${API_BASE_URL}/upload/resume`, {
          method: 'POST',
          headers: {
               'Authorization': `Bearer ${token}`,
               // Don't set Content-Type - browser will set it with boundary for FormData
          },
          body: formData,
     });

     if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Upload failed' }));
          throw new Error(error.message || `HTTP error! status: ${response.status}`);
     }

     return response.json();
}

// Alias for backward compatibility
export const uploadResumeToS3 = uploadResume;


// ============ AUTH/ROLE DETECTION ============

/**
 * Determine user role (candidate or company)
 * Checks Clerk metadata first, then falls back to database
 */
export async function getUserRole(user, getToken) {
     // First check Clerk public metadata
     const role = user?.publicMetadata?.role;

     if (role) {
          return role; // 'user' or 'company'
     }

     // Fallback: Check if user exists in Company collection
     try {
          const { company } = await getCompanyProfile(getToken);
          if (company) {
               return 'company';
          }
     } catch (error) {
          // Company not found, check User collection
     }

     try {
          const { user: userData } = await getUserProfile(getToken);
          if (userData) {
               return 'user';
          }
     } catch (error) {
          // User not found either
     }

     return null; // No role set yet - new user
}
