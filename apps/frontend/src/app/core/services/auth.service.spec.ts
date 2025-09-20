import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest, AuthResponse } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = {
    _id: '123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isAdmin: false,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  };

  const mockTokens = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token'
  };

  const mockAuthResponse: AuthResponse = {
    message: 'Success',
    user: mockUser,
    tokens: mockTokens
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user successfully', () => {
      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      service.register(registerData).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.getAccessToken()).toBe(mockTokens.accessToken);
        expect(service.getRefreshToken()).toBe(mockTokens.refreshToken);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should login user successfully', () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      service.login(loginData).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.getAccessToken()).toBe(mockTokens.accessToken);
        expect(service.getRefreshToken()).toBe(mockTokens.refreshToken);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should clear storage and navigate to login', () => {
      // Set up some tokens first
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      localStorage.setItem('user', JSON.stringify(mockUser));

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', () => {
      const newTokens = {
        accessToken: 'new.access.token',
        refreshToken: 'new.refresh.token'
      };

      localStorage.setItem('refresh_token', 'old.refresh.token');

      service.refreshTokens().subscribe(response => {
        expect(response.tokens).toEqual(newTokens);
        expect(service.getAccessToken()).toBe(newTokens.accessToken);
        expect(service.getRefreshToken()).toBe(newTokens.refreshToken);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old.refresh.token' });
      req.flush({ tokens: newTokens });
    });

    it('should throw error when no refresh token available', () => {
      expect(() => service.refreshTokens()).toThrowError('No refresh token available');
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user successfully', () => {
      service.getCurrentUser().subscribe(response => {
        expect(response.user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUser });
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true for valid non-expired token', () => {
      // Create a mock JWT token that expires in the future
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime };
      const mockToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';

      localStorage.setItem('access_token', mockToken);

      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false for expired token', () => {
      // Create a mock JWT token that has expired
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastTime };
      const mockToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';

      localStorage.setItem('access_token', mockToken);

      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false for malformed token', () => {
      localStorage.setItem('access_token', 'invalid.token');

      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('token management', () => {
    it('should store and retrieve access token', () => {
      const token = 'test.access.token';
      localStorage.setItem('access_token', token);

      expect(service.getAccessToken()).toBe(token);
    });

    it('should store and retrieve refresh token', () => {
      const token = 'test.refresh.token';
      localStorage.setItem('refresh_token', token);

      expect(service.getRefreshToken()).toBe(token);
    });

    it('should return null for missing tokens', () => {
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', () => {
      const currentPassword = 'oldPassword123!';
      const newPassword = 'newPassword123!';
      const expectedResponse = { message: 'Password changed successfully' };

      service.changePassword(currentPassword, newPassword).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ currentPassword, newPassword });
      req.flush(expectedResponse);
    });
  });
});