import { HttpError } from '../utils/httpError.js';

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `No route for ${req.method} ${req.originalUrl}`));
}

/** Converts every error into the { error: { message, details } } envelope. Never leaks stack traces. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'The request body is not valid JSON.' } });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: { message: 'The request body is too large.' } });
  }
  // PostgreSQL constraint violations become client errors instead of 500s.
  if (err.code === '23503') return res.status(422).json({ error: { message: 'A referenced record does not exist.' } });
  if (err.code === '23505') return res.status(409).json({ error: { message: 'A record with these details already exists.' } });
  if (err.code === '23514') return res.status(422).json({ error: { message: 'A value is outside the allowed range.' } });

  const status = err instanceof HttpError ? err.status : 500;
  if (status >= 500) console.error(`[api] ${req.method} ${req.originalUrl}`, err);
  return res.status(status).json({
    error: {
      message: status >= 500 ? 'The server had a problem. Please try again in a moment.' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
