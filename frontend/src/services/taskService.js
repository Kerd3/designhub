import { createResourceService } from './resourceService.js';

const base = createResourceService('/tasks');

export const taskService = {
  ...base,
  updateStatus: (id, status) => base.update(id, { status }),
  assign: (id, assigneeId) => base.update(id, { assigneeId }),
};
