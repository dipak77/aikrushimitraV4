import logger from '../utils/logger.js';

export class AppError extends Error {
  constructor(code, status, message, isOperational = true) {
    super(message);
    this.code = code;
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Something went wrong';

  logger.error('App Error caught by middleware:', {
    code,
    status,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(status).json({
    status: 'error',
    code,
    message
  });
};
