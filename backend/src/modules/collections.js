import {
  projectSchema, projectPatchSchema, clientSchema, clientPatchSchema, taskSchema, taskPatchSchema,
  inquirySchema, inquiryStatusSchema, teamPatchSchema,
} from '../../../shared/schemas.js';
import { createCollectionService } from '../services/collectionService.js';

/** One service per module (projects, clients, tasks, inquiries, team). */
export function createServices(repo) {
  return {
    projects: createCollectionService(repo, 'projects', {
      createSchema: projectSchema,
      patchSchema: projectPatchSchema,
      references: { clientId: 'clients', memberIds: 'team' },
      // Completing a project always means 100%.
      onUpdate: (patch) => (patch.status === 'completed' ? { progress: 100 } : {}),
    }),
    clients: createCollectionService(repo, 'clients', {
      createSchema: clientSchema,
      patchSchema: clientPatchSchema,
      onCreate: (data) => ({
        clientSince: new Date().toISOString().slice(0, 10),
        phone: data.phone ?? '',
        website: data.website ?? '',
        notes: data.notes ?? '',
      }),
    }),
    tasks: createCollectionService(repo, 'tasks', {
      createSchema: taskSchema,
      patchSchema: taskPatchSchema,
      references: { projectId: 'projects', assigneeId: 'team' },
    }),
    inquiries: createCollectionService(repo, 'inquiries', {
      createSchema: inquirySchema,
      patchSchema: inquiryStatusSchema,
      // Status and timestamp are always set by the server, never by the public form.
      onCreate: () => ({ status: 'new', submittedAt: new Date().toISOString() }),
    }),
    team: createCollectionService(repo, 'team', { createSchema: null, patchSchema: teamPatchSchema }),
  };
}
