import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Unhandled API Error on [${req.method} ${req.url}]:`, err.stack || err.message);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error. Please try again later.';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method} ${req.originalUrl}]`,
  });
}
