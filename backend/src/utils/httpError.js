export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (what = 'record') => new HttpError(404, `We could not find that ${what}. It may have been deleted.`);
export const unprocessable = (details) => new HttpError(422, 'Some fields need attention.', details);
