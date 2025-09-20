// Shared utility functions for the e-commerce platform

import Joi from 'joi';

/**
 * Email validation schema
 */
export const emailSchema = Joi.string()
  .email()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

/**
 * Password validation schema
 */
export const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
  });

/**
 * MongoDB ObjectId validation schema
 */
export const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
  });

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Generate unique order number
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

/**
 * Validate environment variables
 */
export const validateEnvironment = (requiredVars: string[]): void => {
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Error response helper
 */
export const createErrorResponse = (message: string, code?: string) => ({
  success: false,
  error: message,
  code
});

/**
 * Success response helper
 */
export const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  message
});