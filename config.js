// Configuration and utilities
const supabaseUrl = window.APP_CONFIG.SUPABASE_URL;
const supabaseKey = window.APP_CONFIG.SUPABASE_KEY;
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Explicitly make BACKEND_URL globally available
window.BACKEND_URL = window.APP_CONFIG.BACKEND_URL;
const BACKEND_URL = window.APP_CONFIG.BACKEND_URL;

// Helper functions for API requests
const api = {
  get: async (endpoint, token = null) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, { headers });
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },
  
  post: async (endpoint, data, token = null) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
};