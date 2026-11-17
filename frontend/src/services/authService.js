/**
 * DEMO ACCESS ONLY — not production authentication.
 *
 * The workspace is a portfolio demonstration. This gate compares the form
 * input with a published demo account entirely in the browser. It protects
 * nothing: anyone can read these values in the page source, which is why
 * they are also printed on the login screen.
 *
 * Only a session marker (name, email, start time) is stored. The password is
 * never written to storage.
 */
export const DEMO_ACCOUNT = Object.freeze({
  email: 'demo@designhub.example',
  password: 'studio-demo-2026',
  name: 'Alex Morgan',
  role: 'Studio Lead (demo)',
});

const SESSION_KEY = 'designhub.session';

export const authService = {
  async login({ email, password }) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const matches = email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password;
    if (!matches) {
      throw new Error('That email and password do not match the demo account shown below.');
    }
    const session = { email: DEMO_ACCOUNT.email, name: DEMO_ACCOUNT.name, startedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* private mode: session lasts for this page only */
    }
    return session;
  },

  logout() {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  },

  getSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};
