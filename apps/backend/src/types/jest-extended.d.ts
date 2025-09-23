/// <reference types="jest" />
/// <reference types="jest-extended" />

// Extend Jest's expect interface
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveLength(length: number): R;
      toHaveProperty(property: string, value?: any): R;
      rejects: {
        toThrow(error?: string | RegExp | Error): Promise<R>;
        toThrowError(error?: string | RegExp | Error): Promise<R>;
      };
    }
  }
}