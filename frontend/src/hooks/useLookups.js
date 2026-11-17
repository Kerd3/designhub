import { useMemo } from 'react';
import { useResource } from './useResource.js';
import { projectService } from '@/services/projectService.js';
import { clientService } from '@/services/clientService.js';
import { teamService } from '@/services/teamService.js';

/**
 * Reference data most workspace pages need for names and select options:
 * projects, clients and team members, loaded in parallel.
 */
export function useLookups({ projects = true, clients = true, team = true } = {}) {
  const resource = useResource(
    async ({ signal }) => {
      const [p, c, t] = await Promise.all([
        projects ? projectService.list({ signal }) : [],
        clients ? clientService.list({ signal }) : [],
        team ? teamService.list({ signal }) : [],
      ]);
      return { projects: p, clients: c, team: t };
    },
    [projects, clients, team],
  );

  const maps = useMemo(() => {
    const data = resource.data ?? { projects: [], clients: [], team: [] };
    return {
      ...data,
      projectById: Object.fromEntries(data.projects.map((p) => [p.id, p])),
      clientById: Object.fromEntries(data.clients.map((c) => [c.id, c])),
      memberById: Object.fromEntries(data.team.map((m) => [m.id, m])),
    };
  }, [resource.data]);

  return { ...resource, ...maps };
}
