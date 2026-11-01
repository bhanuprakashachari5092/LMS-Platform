/**
 * Centralized API configuration and URL builder.
 * Dynamically resolves backend API v1 endpoints in both local development and production domains.
 */

const getBaseUrl = (): string => {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? (process.env as any) : {});
  const envApiUrl = env.VITE_API_URL || env.VITE_BACKEND_URL;
  if (envApiUrl && envApiUrl.trim()) {
    return envApiUrl.trim();
  }

  // If running in browser and NOT localhost/127.0.0.1, use relative origin with /api
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};

const rawBaseUrl = getBaseUrl();

// Strip any trailing slashes
const cleanUrl = rawBaseUrl.replace(/\/+$/, '');

// Ensure /api/v1 is appended for the Spring Boot REST API
export const API_BASE_URL = cleanUrl.endsWith('/api/v1') 
  ? cleanUrl 
  : (cleanUrl.endsWith('/api') ? `${cleanUrl}/v1` : `${cleanUrl}/api/v1`);

/**
 * Builds a clean, fully-qualified API URL without redundant slashes.
 * @param endpoint - Relative or leading-slash path (e.g. '/courses' or 'courses?status=published')
 */
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.trim().replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  buildApiUrl,
};
