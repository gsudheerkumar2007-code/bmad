import { Request, Response } from 'express';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { User } from '../models/User';

export class AuthController {
  private JWT_SECRET = process.env.JWT_SECRET;
  private JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  private JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Basic validation
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          error: 'Missing required fields: email, password, firstName, lastName'
        });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({
          error: 'Password must be at least 8 characters long'
        });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          error: 'User with this email already exists'
        });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName
      });

      await user.save();

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Return user without password
      const userResponse = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      };

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        tokens
      });
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        res.status(400).json({
          error: 'Email and password are required'
        });
        return;
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({
          error: 'Invalid email or password'
        });
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          error: 'Invalid email or password'
        });
        return;
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Return user without password
      const userResponse = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      };

      res.json({
        message: 'Login successful',
        user: userResponse,
        tokens
      });
    } catch (error) {
      res.status(401).json({
        error: (error as Error).message
      });
    }
  }

  async refreshTokens(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Refresh token is required'
        });
        return;
      }

      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET);

      // Find user
      const user = await User.findById(payload.userId);
      if (!user) {
        res.status(401).json({
          error: 'Invalid refresh token'
        });
        return;
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      res.json({
        message: 'Tokens refreshed successfully',
        tokens
      });
    } catch (error) {
      res.status(401).json({
        error: 'Invalid refresh token'
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Access token is required'
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = jwt.verify(token, this.JWT_SECRET);

      const user = await User.findById(payload.userId).select('-password');
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      res.status(401).json({
        error: 'Invalid access token'
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Access token is required'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: 'Current password and new password are required'
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          error: 'New password must be at least 8 characters long'
        });
        return;
      }

      const token = authHeader.substring(7);
      const payload = jwt.verify(token, this.JWT_SECRET);

      const user = await User.findById(payload.userId);
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          error: 'Current password is incorrect'
        });
        return;
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedNewPassword;
      await user.save();

      res.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message
      });
    }
  }

  private generateTokens(user: any) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN
    });

    return {
      accessToken,
      refreshToken
    };
  }
}

export const authController = new AuthController();