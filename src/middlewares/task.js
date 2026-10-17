export class HttpError extends Error {
  constructor(status, message, code = 'BAD_REQUEST') { super(message); this.status = status; this.code = code; }
}

function validateBody(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Request body must be a JSON object');
  const allowed = new Set(['title', 'completed']);
  const unknown = Object.keys(body).filter((key) => !allowed.has(key));
  if (unknown.length) throw new HttpError(400, 'Request body contains unknown fields');
  if (mode === 'patch' && Object.keys(body).length === 0) throw new HttpError(400, 'At least one field is required');
  if (mode === 'post' && !Object.hasOwn(body, 'title')) throw new HttpError(400, 'title is required');
  if (Object.hasOwn(body, 'title')) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0 || body.title.trim().length > 255) {
      throw new HttpError(400, 'title must be a non-empty string with at most 255 characters');
    }
    body.title = body.title.trim();
  }
  if (Object.hasOwn(body, 'completed') && typeof body.completed !== 'boolean') throw new HttpError(400, 'completed must be a boolean');
  if (mode === 'post' && !Object.hasOwn(body, 'completed')) body.completed = false;
}

export function validateTaskBody(mode) {
  return (req, _res, next) => { validateBody(req.body, mode); next(); };
}

export function validateTaskId(req, _res, next) {
  const value = req.params.id;
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new HttpError(400, 'id must be a positive integer');
  req.params.id = Number(value);
  next();
}

export function notFoundHandler(req, _res, next) { next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND')); }

export function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);
  if (err?.type === 'entity.parse.failed') err = new HttpError(400, 'Malformed JSON');
  else if (err?.type === 'entity.too.large') err = new HttpError(413, 'Request body is too large', 'PAYLOAD_TOO_LARGE');
  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: { code: err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR'), message } });
}
