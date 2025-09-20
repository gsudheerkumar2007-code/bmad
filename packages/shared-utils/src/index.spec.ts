import {
  formatCurrency,
  generateOrderNumber,
  validateEnvironment,
  createErrorResponse,
  createSuccessResponse
} from './index';

describe('Shared Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency with default USD', () => {
      expect(formatCurrency(29.99)).toBe('$29.99');
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('should format currency with specified currency', () => {
      expect(formatCurrency(29.99, 'EUR')).toBe('€29.99');
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate a unique order number', () => {
      const orderNumber1 = generateOrderNumber();
      const orderNumber2 = generateOrderNumber();

      expect(orderNumber1).toMatch(/^ORD-\d{6}-[A-Z0-9]{6}$/);
      expect(orderNumber2).toMatch(/^ORD-\d{6}-[A-Z0-9]{6}$/);
      expect(orderNumber1).not.toBe(orderNumber2);
    });
  });

  describe('validateEnvironment', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should not throw when all required variables exist', () => {
      process.env.TEST_VAR = 'test';
      expect(() => validateEnvironment(['TEST_VAR'])).not.toThrow();
    });

    it('should throw when required variables are missing', () => {
      delete process.env.MISSING_VAR;
      expect(() => validateEnvironment(['MISSING_VAR'])).toThrow(
        'Missing required environment variables: MISSING_VAR'
      );
    });
  });

  describe('createErrorResponse', () => {
    it('should create proper error response', () => {
      const response = createErrorResponse('Test error', 'TEST_CODE');
      expect(response).toEqual({
        success: false,
        error: 'Test error',
        code: 'TEST_CODE'
      });
    });

    it('should create error response without code', () => {
      const response = createErrorResponse('Test error');
      expect(response).toEqual({
        success: false,
        error: 'Test error'
      });
    });
  });

  describe('createSuccessResponse', () => {
    it('should create proper success response', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data, 'Success message');
      expect(response).toEqual({
        success: true,
        data,
        message: 'Success message'
      });
    });

    it('should create success response without message', () => {
      const data = { id: 1 };
      const response = createSuccessResponse(data);
      expect(response).toEqual({
        success: true,
        data
      });
    });
  });
});