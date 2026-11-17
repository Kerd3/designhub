import { readFileSync } from 'node:fs';

const SEED_URL = new URL('../../../shared/demo-data.json', import.meta.url);

/** The single demo dataset shared with the frontend mock API. */
export function loadSeed() {
  const raw = JSON.parse(readFileSync(SEED_URL, 'utf8'));
  return {
    projects: raw.projects,
    clients: raw.clients,
    tasks: raw.tasks,
    inquiries: raw.inquiries,
    team: raw.team,
    activities: raw.activities,
  };
}
