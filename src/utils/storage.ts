import { Lead, Project, Payment, Review, AppAsset, SiteSettings } from '../types';

// ─── Two-Layer Cache: Memory (instant) + localStorage (survives refresh) ──────
const CACHE_VERSION = 'v2';
const LS_PREFIX     = `acadomix_cache_${CACHE_VERSION}_`;
const MEM_CACHE: Record<string, { data: any; ts: number }> = {};

// How long (ms) cached data is considered FRESH (no network call needed)
const FRESH_TTL: Record<string, number> = {
  '/projects':  15 * 60_000, // 15 min — rarely changes
  '/reviews':    5 * 60_000, // 5 min
  '/payments':   2 * 60_000, // 2 min
  '/leads':      2 * 60_000, // 2 min
  '/settings':  10 * 60_000, // 10 min
  '/assets':    30 * 60_000, // 30 min
};
const DEFAULT_FRESH_TTL = 3 * 60_000; // 3 min fallback

function getTTL(endpoint: string) {
  const base = endpoint.split('?')[0];
  return FRESH_TTL[base] ?? DEFAULT_FRESH_TTL;
}

// ── Read from localStorage ────────────────────────────────────────────────────
function lsGet(key: string): { data: any; ts: number } | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

// ── Write to localStorage (fire-and-forget, never blocks render) ──────────────
function lsSet(key: string, entry: { data: any; ts: number }) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry)); } catch { /* quota */ }
}

// ── Invalidate a cache key in both layers ─────────────────────────────────────
function invalidate(baseEndpoint: string) {
  Object.keys(MEM_CACHE).forEach(k => { if (k.startsWith(baseEndpoint)) delete MEM_CACHE[k]; });
  try {
    const prefix = LS_PREFIX + baseEndpoint;
    Object.keys(localStorage).forEach(k => { if (k.startsWith(prefix)) localStorage.removeItem(k); });
  } catch { /* ignore */ }
}

// ── Core fetch with two-layer SWR ─────────────────────────────────────────────
async function fetchAPI(endpoint: string, options?: RequestInit): Promise<any> {
  const isGet = !options?.method || options.method === 'GET';

  const token = localStorage.getItem('acadomix_admin_auth');
  const finalOptions: RequestInit = { ...options };
  if (token) {
    finalOptions.headers = { ...finalOptions.headers, 'Authorization': `Bearer ${token}` };
  }

  if (!isGet) {
    const res = await fetch(`/api${endpoint}`, finalOptions);
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    const data = await res.json();
    invalidate(endpoint.split('?')[0]);
    return data;
  }

  // ── GET path: memory → localStorage → network ────────────────────────────
  const ttl = getTTL(endpoint);
  const now  = Date.now();

  // 1. Memory cache (fastest — same JS heap)
  const mem = MEM_CACHE[endpoint];
  if (mem && now - mem.ts < ttl) return mem.data;

  // 2. localStorage cache — serves instantly even after page refresh
  const ls = lsGet(endpoint);
  if (ls) {
    // Populate memory layer from localStorage
    MEM_CACHE[endpoint] = ls;

    if (now - ls.ts < ttl) {
      // FRESH — no network call needed
      return ls.data;
    }

    // STALE — return stale data immediately, revalidate in background
    revalidate(endpoint, finalOptions);
    return ls.data;
  }

  // 3. No cache at all — must wait for network
  return networkFetch(endpoint, finalOptions);
}

/** Fire a background refetch and silently update both cache layers */
function revalidate(endpoint: string, options: RequestInit) {
  fetch(`/api${endpoint}`, options)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data == null) return;
      const entry = { data, ts: Date.now() };
      MEM_CACHE[endpoint] = entry;
      lsSet(endpoint, entry);
    })
    .catch(() => { /* silent — stale data already in use */ });
}

/** Blocking network fetch — used only when there is no cached data at all */
async function networkFetch(endpoint: string, options: RequestInit): Promise<any> {
  const res = await fetch(`/api${endpoint}`, options);
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  const data = await res.json();
  const entry = { data, ts: Date.now() };
  MEM_CACHE[endpoint] = entry;
  lsSet(endpoint, entry);
  return data;
}

// ── Synchronously get cached data if available (0ms instant state initialization) ──
export function getCachedData<T = any>(endpoint: string): T | null {
  const mem = MEM_CACHE[endpoint];
  if (mem && mem.data !== undefined) return mem.data as T;
  const ls = lsGet(endpoint);
  if (ls && ls.data !== undefined) {
    MEM_CACHE[endpoint] = ls;
    return ls.data as T;
  }
  return null;
}

/** Prefetch multiple endpoints in parallel (call after login to warm cache) */
export async function prefetchAdminData() {
  const token = localStorage.getItem('acadomix_admin_auth');
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const endpoints = ['/reviews', '/payments', '/projects', '/leads', '/settings'];
  await Promise.allSettled(endpoints.map(ep => networkFetch(ep, { headers })));
}

/** Prefetch all public data in parallel (call on app load to warm cache for visitors) */
export async function prefetchPublicData() {
  // fetchAPI naturally checks cache first and only hits network if needed
  const endpoints = [
    '/reviews',
    '/projects',
    '/settings',
    '/assets?asset_name=logo',
    '/assets?asset_name=payment_qr'
  ];
  await Promise.allSettled(endpoints.map(ep => fetchAPI(ep)));
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
  updateVisibility: async (id: number, visibleInHome: boolean): Promise<boolean> => {
    await fetchAPI('/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, visible_in_home: visibleInHome })
    });
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
  getAll: async (): Promise<AppAsset[]> => {
    return fetchAPI(`/assets`);
  },
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
  delete: async (assetName: string): Promise<boolean> => {
    await fetchAPI(`/assets?asset_name=${assetName}`, { method: 'DELETE' });
    return true;
  }
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
      if (result.success && result.token) {
        localStorage.setItem('acadomix_admin_auth', result.token);
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
    return !!localStorage.getItem('acadomix_admin_auth');
  },
};

// Database DB (Admin Only)
export const DatabaseDB = {
  getTables: async (): Promise<string[]> => fetchAPI('/database?action=tables'),
  getSchema: async (tableName: string): Promise<any[]> => fetchAPI(`/database?action=schema&table=${tableName}`),
  getStats: async (): Promise<any> => fetchAPI('/database?action=stats'),
  getData: async (tableName: string, page = 1, limit = 50): Promise<any> =>
    fetchAPI(`/database?action=data&table=${tableName}&page=${page}&limit=${limit}`),
  insertRow: async (tableName: string, data: Record<string, any>): Promise<any> =>
    fetchAPI('/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'insert', table: tableName, data })
    }),
  deleteRow: async (tableName: string, id: number): Promise<any> =>
    fetchAPI(`/database?table=${tableName}&id=${id}`, { method: 'DELETE' }),
  updateRow: async (tableName: string, id: number, data: Record<string, any>): Promise<any> =>
    fetchAPI('/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', table: tableName, id, data })
    }),
  executeQuery: async (query: string): Promise<any> =>
    fetchAPI('/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'query', query })
    }),
};
