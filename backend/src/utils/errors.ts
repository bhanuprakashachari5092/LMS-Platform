/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * STANDARDIZED LMS ERROR ARCHITECTURE — KaizenQ LMS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ApiError } from './ApiError';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class ConflictError extends ApiError {
  readonly conflict = true;
  readonly code = ErrorCode.CONFLICT;
  readonly currentRevision: number;
  readonly expectedRevision: number;

  constructor(
    message: string,
    currentRevision: number,
    expectedRevision: number
  ) {
    super(409, message);
    this.name = 'ConflictError';
    this.currentRevision = currentRevision;
    this.expectedRevision = expectedRevision;
  }
}

export class NotFoundError extends ApiError {
  readonly code = ErrorCode.NOT_FOUND;
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  readonly code = ErrorCode.VALIDATION_ERROR;
  readonly errors?: any;
  constructor(message = 'Invalid request parameters', errors?: any) {
    super(400, message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class UnauthorizedError extends ApiError {
  readonly code = ErrorCode.UNAUTHORIZED;
  constructor(message = 'Authentication required') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  readonly code = ErrorCode.FORBIDDEN;
  constructor(message = 'Access forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class InternalError extends ApiError {
  readonly code = ErrorCode.INTERNAL_ERROR;
  constructor(message = 'Internal server error') {
    super(500, message);
    this.name = 'InternalError';
  }
}

export { ApiError };

