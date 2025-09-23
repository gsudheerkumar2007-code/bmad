import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export class AuthService {
  private get JWT_SECRET() {
    return process.env.JWT_SECRET;
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const authService = new AuthService();