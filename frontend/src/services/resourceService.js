import { apiClient } from './apiClient.js';

/**
 * Builds the standard REST service for a collection. Domain services extend
 * it with intention-revealing helpers (updateStatus, archive, ...).
 */
export function createResourceService(basePath) {
  return {
    list: (options) => apiClient.get(basePath, options),
    get: (id, options) => apiClient.get(`${basePath}/${encodeURIComponent(id)}`, options),
    create: (input) => apiClient.post(basePath, input),
    update: (id, patch) => apiClient.patch(`${basePath}/${encodeURIComponent(id)}`, patch),
    remove: (id) => apiClient.del(`${basePath}/${encodeURIComponent(id)}`),
  };
}
