import { apiClient } from './apiClient.js';

export const dashboardService = {
  /** Totals and breakdowns computed from the dataset by the server (or mock server). */
  getSummary: (options) => apiClient.get('/dashboard/summary', options),
  getActivity: (options) => apiClient.get('/activities', options),
};

export const demoService = {
  /** Restores every collection to the original seed data. */
  reset: () => apiClient.post('/demo/reset'),
};
