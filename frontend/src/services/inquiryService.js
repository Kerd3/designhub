import { createResourceService } from './resourceService.js';

const base = createResourceService('/inquiries');

export const inquiryService = {
  list: base.list,
  get: base.get,
  /** Public contact form submission. Resolves only when the server stored it. */
  submit: (input) => base.create(input),
  updateStatus: (id, status) => base.update(id, { status }),
  archive: (id) => base.update(id, { status: 'archived' }),
};
