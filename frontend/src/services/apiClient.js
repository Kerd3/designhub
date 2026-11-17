/**
 * Centralised API client. Every service calls get/post/patch/del from here;
 * no component calls fetch directly.
 *
 * Two transports share one contract ({ data } on success, { error } on failure):
 *  - "api":  real HTTP requests to the Express backend (VITE_API_BASE_URL)
 *  - "mock": an in-browser REST handler backed by localStorage (default)
 * Switching is a config change (VITE_DATA_SOURCE); pages and services are unchanged.
 */
import { handleMockRequest } from './mock/mockServer.js';

export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'mock';
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const MOCK_LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 350);

export class ApiError extends Error {
  constructor(message, { status = 0, details = null, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.details = details; // { field: message } for validation errors
  }
  get isNetworkError() { return this.status === 0; }
  get isNotFound() { return this.status === 404; }
  get isValidation() { return this.status === 422; }
}

function parsePayload(status, ok, payload) {
  if (!ok) {
    throw new ApiError(payload?.error?.message || defaultMessage(status), {
      status,
      details: payload?.error?.details ?? null,
    });
  }
  // 204 No Content and empty bodies resolve to null.
  return payload?.data ?? null;
}

function defaultMessage(status) {
  if (status === 404) return 'We could not find that record. It may have been deleted.';
  if (status === 422) return 'Some fields need attention.';
  if (status >= 500) return 'The server had a problem. Please try again in a moment.';
  return `Request failed with status ${status}.`;
}

async function httpTransport(method, path, body, signal) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the server. Check your connection and try again.', { status: 0, cause: error });
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiError('The server sent a response we could not read.', { status: response.status });
    }
  }
  return parsePayload(response.status, response.ok, payload);
}

function readLatencyOverride() {
  try {
    const value = window.localStorage.getItem('designhub.mock.latency');
    return value === null ? MOCK_LATENCY : Number(value);
  } catch {
    return MOCK_LATENCY;
  }
}

async function mockTransport(method, path, body, signal) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, readLatencyOverride());
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
  // Round-trip through JSON so callers never hold references into the mock store.
  const cloned = body === undefined ? undefined : JSON.parse(JSON.stringify(body));
  const { status, payload } = handleMockRequest(method, path, cloned);
  return parsePayload(status, status >= 200 && status < 300, payload);
}

const transport = DATA_SOURCE === 'api' ? httpTransport : mockTransport;

export const apiClient = {
  get: (path, options = {}) => transport('GET', path, undefined, options.signal),
  post: (path, body, options = {}) => transport('POST', path, body ?? {}, options.signal),
  patch: (path, body, options = {}) => transport('PATCH', path, body ?? {}, options.signal),
  del: (path, options = {}) => transport('DELETE', path, undefined, options.signal),
};

export const dataSourceLabel = DATA_SOURCE === 'api' ? `Live API · ${BASE_URL}` : 'Demo data · in-browser mock API';
