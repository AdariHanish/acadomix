import { Lead, Project, Payment, Review, AppAsset, SiteSettings } from '../types';

export function initializeStorage() {
  // Deprecated, no-op since data comes from API now
}

// In-memory cache to make transactions fraction-of-a-second fast
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to handle API responses with caching for GET requests
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const isGet = !options || !options.method || options.method === 'GET';
  
  if (isGet && cache[endpoint] && Date.now() - cache[endpoint].timestamp < CACHE_DURATION) {
    return cache[endpoint].data;
  }

  const response = await fetch(`/api${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (isGet) {
    cache[endpoint] = { data, timestamp: Date.now() };
  } else {
    // Clear cache on mutations to ensure fresh data
    const baseEndpoint = endpoint.split('?')[0];
    Object.keys(cache).forEach(key => {
      if (key.startsWith(baseEndpoint)) {
        delete cache[key];
      }
    });
  }
  
  return data;
}

// Projects
export const ProjectsDB = {
  getAll: async (): Promise<Project[]> => fetchAPI('/projects'),
  getPopular: async (): Promise<Project[]> => {
    const projects = await fetchAPI('/projects');
    return projects.filter((p: Project) => p.is_popular);
  },
  getTrending: async (): Promise<Project[]> => {
    const projects = await fetchAPI('/projects');
    return projects.filter((p: Project) => p.is_trending);
  },
  getByCategory: async (category: string): Promise<Project[]> => {
    const projects = await fetchAPI('/projects');
    return projects.filter((p: Project) => p.category === category);
  },
  add: async (project: Omit<Project, 'id' | 'created_at'>): Promise<Project> => 
    fetchAPI('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    }),
  update: async (id: number, updates: Partial<Project>): Promise<Project | null> => 
    fetchAPI('/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    }),
  delete: async (id: number): Promise<boolean> => {
    await fetchAPI(`/projects?id=${id}`, { method: 'DELETE' });
    return true;
  },
};

// Reviews
export const ReviewsDB = {
  getAll: async (): Promise<Review[]> => fetchAPI('/reviews'),
  getApproved: async (): Promise<Review[]> => {
    const reviews = await fetchAPI('/reviews');
    return reviews.filter((r: Review) => r.is_approved);
  },
  getPending: async (): Promise<Review[]> => {
    const reviews = await fetchAPI('/reviews');
    return reviews.filter((r: Review) => !r.is_approved);
  },
  add: async (review: Omit<Review, 'id' | 'created_at' | 'is_approved'>): Promise<Review> => 
    fetchAPI('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    }),
  approve: async (id: number): Promise<boolean> => {
    await fetchAPI('/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved: true })
    });
    return true;
  },
  reject: async (id: number): Promise<boolean> => {
    await fetchAPI(`/reviews?id=${id}`, { method: 'DELETE' });
    return true;
  },
  delete: async (id: number): Promise<boolean> => {
    await fetchAPI(`/reviews?id=${id}`, { method: 'DELETE' });
    return true;
  },
};

// Payments
export const PaymentsDB = {
  getAll: async (): Promise<Payment[]> => fetchAPI('/payments'),
  getPending: async (): Promise<Payment[]> => {
    const payments = await fetchAPI('/payments');
    return payments.filter((p: Payment) => p.status === 'pending');
  },
  add: async (payment: Omit<Payment, 'id' | 'created_at' | 'status'>): Promise<Payment> => 
    fetchAPI('/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    }),
  updateStatus: async (id: number, status: Payment['status']): Promise<boolean> => {
    await fetchAPI('/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    return true;
  },
  delete: async (id: number): Promise<boolean> => {
    await fetchAPI(`/payments?id=${id}`, { method: 'DELETE' });
    return true;
  },
};

// Leads
export const LeadsDB = {
  getAll: async (): Promise<Lead[]> => fetchAPI('/leads'),
  add: async (lead: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<Lead> => 
    fetchAPI('/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    }),
  updateStatus: async (id: number, status: Lead['status']): Promise<boolean> => {
    await fetchAPI('/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    return true;
  },
  delete: async (id: number): Promise<boolean> => {
    await fetchAPI(`/leads?id=${id}`, { method: 'DELETE' });
    return true;
  },
};

// App Assets
export const AssetsDB = {
  get: async (assetName: string): Promise<AppAsset | undefined> => {
    const assets = await fetchAPI(`/assets?asset_name=${assetName}`);
    return assets.length > 0 ? assets[0] : undefined;
  },
  set: async (assetName: string, data: string, mimeType: string): Promise<AppAsset> => {
    await fetchAPI('/assets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset_name: assetName, data, mime_type: mimeType })
    });
    return { id: 0, asset_name: assetName, data, mime_type: mimeType, updated_at: new Date().toISOString() };
  },
};

// Settings
export const SettingsDB = {
  get: async (): Promise<SiteSettings> => fetchAPI('/settings'),
  update: async (updates: Partial<SiteSettings>): Promise<SiteSettings> => {
    await fetchAPI('/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return updates as SiteSettings;
  },
};

// Admin Auth
export const AdminAuth = {
  login: async (password: string): Promise<boolean> => {
    try {
      const result = await fetchAPI('/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (result.success) {
        localStorage.setItem('acadomix_admin_auth', 'true');
        return true;
      }
    } catch {
      return false;
    }
    return false;
  },
  logout: (): void => {
    localStorage.removeItem('acadomix_admin_auth');
  },
  isLoggedIn: (): boolean => {
    return localStorage.getItem('acadomix_admin_auth') === 'true';
  },
};
