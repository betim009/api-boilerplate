const MAX_TASK_ID = 4294967295;

export class HttpError extends Error {
  constructor(status, message, code = 'BAD_REQUEST') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function validateRequestBody(body) {
  if (!body) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  if (typeof body !== 'object') {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  if (Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
}

function validateAllowedFields(body) {
  const bodyKeys = Object.keys(body);

  for (const key of bodyKeys) {
    if (key === 'title') {
      continue;
    }

    if (key === 'completed') {
      continue;
    }

    throw new HttpError(400, 'Request body contains unknown fields');
  }
}

function validateTitle(body) {
  const hasTitle = Object.hasOwn(body, 'title');

  if (!hasTitle) {
    return;
  }

  const title = body.title;

  if (typeof title !== 'string') {
    throw new HttpError(400, 'title must be a non-empty string with at most 255 characters');
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    throw new HttpError(400, 'title must be a non-empty string with at most 255 characters');
  }

  if (trimmedTitle.length > 255) {
    throw new HttpError(400, 'title must be a non-empty string with at most 255 characters');
  }

  body.title = trimmedTitle;
}

function validateCompleted(body) {
  const hasCompleted = Object.hasOwn(body, 'completed');

  if (!hasCompleted) {
    return;
  }

  if (typeof body.completed !== 'boolean') {
    throw new HttpError(400, 'completed must be a boolean');
  }
}

export function validateTaskBody(req, res, next) {
  void res;
  const body = req.body;

  validateRequestBody(body);
  validateAllowedFields(body);

  const hasTitle = Object.hasOwn(body, 'title');
  const hasCompleted = Object.hasOwn(body, 'completed');

  if (req.method === 'POST') {
    if (!hasTitle) {
      throw new HttpError(400, 'title is required');
    }
  }

  if (req.method === 'PATCH') {
    if (!hasTitle) {
      if (!hasCompleted) {
        throw new HttpError(400, 'At least one field is required');
      }
    }
  }

  validateTitle(body);
  validateCompleted(body);

  if (req.method === 'POST') {
    if (!hasCompleted) {
      body.completed = false;
    }
  }

  next();
}

export function validateTaskId(req, res, next) {
  void res;
  const value = req.params.id;

  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, 'id must be a positive integer');
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    throw new HttpError(400, 'id must be a positive integer');
  }

  if (id > MAX_TASK_ID) {
    throw new HttpError(400, 'id must be a positive integer');
  }

  req.params.id = id;
  next();
}

export function notFoundHandler(req, _res, next) {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  const error = new HttpError(404, message, 'ROUTE_NOT_FOUND');
  next(error);
}

export function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err && err.type === 'entity.parse.failed') {
    err = new HttpError(400, 'Malformed JSON');
  }

  if (err && err.type === 'entity.too.large') {
    err = new HttpError(413, 'Request body is too large', 'PAYLOAD_TOO_LARGE');
  }

  let status = 500;
  const hasHttpStatus = err && Number.isInteger(err.status);

  if (hasHttpStatus) {
    if (err.status >= 400) {
      if (err.status < 600) {
        status = err.status;
      }
    }
  }

  let message = 'Internal server error';

  if (status !== 500) {
    message = err.message;
  }

  let code = 'INTERNAL_ERROR';

  if (status !== 500) {
    code = err.code || 'HTTP_ERROR';
  }

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}
