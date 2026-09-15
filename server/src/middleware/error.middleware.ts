import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Unhandled API Error:', err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
    return;
  }

  // Multer Errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File too large. Maximum allowed file size is 25MB.',
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files uploaded in a single batch. Maximum allowed is 50 files.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
    return;
  }

  // Custom client errors
  if (err.status && err.status < 500) {
    res.status(err.status).json({
      success: false,
      message: err.message || 'Client error',
    });
    return;
  }

  // General 500 Internal Server Error
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
}
