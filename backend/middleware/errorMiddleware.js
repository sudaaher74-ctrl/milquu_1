import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, { stack: err.stack });

  const isProduction = process.env.NODE_ENV === 'production';
  // Don't leak internal error details (DB errors, stack traces) to clients in production
  const message = isProduction && statusCode >= 500 ? 'Server Error' : err.message;

  res.status(statusCode).json({
    message,
    stack: isProduction ? null : err.stack,
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
