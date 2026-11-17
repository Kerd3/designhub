import { createResourceService } from './resourceService.js';

const base = createResourceService('/projects');

export const projectService = {
  ...base,
  updateStatus: (id, status) => base.update(id, { status }),
  updateProgress: (id, progress) => base.update(id, { progress }),
};
