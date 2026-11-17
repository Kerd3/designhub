import { createResourceService } from './resourceService.js';

const base = createResourceService('/team');

export const teamService = {
  list: base.list,
  get: base.get,
  updateAvailability: (id, availability) => base.update(id, { availability }),
};
