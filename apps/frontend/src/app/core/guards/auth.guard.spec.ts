import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthGuard, AdminGuard, GuestGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuards', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
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

  const mockAdminUser = { ...mockUser, isAdmin: true };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(false),
      currentUser$: of(null)
    });
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        AdminGuard,
        GuestGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('AuthGuard', () => {
    let guard: AuthGuard;

    beforeEach(() => {
      guard = TestBed.inject(AuthGuard);
    });

    it('should be created', () => {
      expect(guard).toBeTruthy();
    });

    it('should allow access when user is authenticated', (done) => {
      // Mock authenticated state
      Object.defineProperty(authServiceSpy, 'isAuthenticated$', {
        writable: true,
        value: of(true)
      });

      const routeSnapshot = {} as any;
      const stateSnapshot = { url: '/dashboard' } as any;

      guard.canActivate(routeSnapshot, stateSnapshot).subscribe(result => {
        expect(result).toBeTruthy();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('should redirect to login when user is not authenticated', (done) => {
      // Mock unauthenticated state
      Object.defineProperty(authServiceSpy, 'isAuthenticated$', {
        writable: true,
        value: of(false)
      });

      const routeSnapshot = {} as any;
      const stateSnapshot = { url: '/dashboard' } as any;

      guard.canActivate(routeSnapshot, stateSnapshot).subscribe(result => {
        expect(result).toBeFalsy();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
          queryParams: { returnUrl: '/dashboard' }
        });
        done();
      });
    });
  });

  describe('AdminGuard', () => {
    let guard: AdminGuard;

    beforeEach(() => {
      guard = TestBed.inject(AdminGuard);
    });

    it('should be created', () => {
      expect(guard).toBeTruthy();
    });

    it('should allow access when user is admin', (done) => {
      // Mock admin user
      Object.defineProperty(authServiceSpy, 'currentUser$', {
        writable: true,
        value: of(mockAdminUser)
      });

      const routeSnapshot = {} as any;
      const stateSnapshot = {} as any;

      guard.canActivate(routeSnapshot, stateSnapshot).subscribe(result => {
        expect(result).toBeTruthy();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('should redirect to home when user is not admin', (done) => {
      // Mock regular user
      Object.defineProperty(authServiceSpy, 'currentUser$', {
        writable: true,
        value: of(mockUser)
      });

      const routeSnapshot = {} as any;
      const stateSnapshot = {} as any;

      guard.canActivate(routeSnapshot, stateSnapshot).subscribe(result => {
        expect(result).toBeFalsy();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });

    it('should redirect to home when user is null', (done) => {
      // Mock no user
      Object.defineProperty(authServiceSpy, 'currentUser$', {
        writable: true,
        value: of(null)
      });

      const routeSnapshot = {} as any;
      const stateSnapshot = {} as any;

      guard.canActivate(routeSnapshot, stateSnapshot).subscribe(result => {
        expect(result).toBeFalsy();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });
  });

  describe('GuestGuard', () => {
    let guard: GuestGuard;

    beforeEach(() => {
      guard = TestBed.inject(GuestGuard);
    });

    it('should be created', () => {
      expect(guard).toBeTruthy();
    });

    it('should allow access when user is not authenticated', (done) => {
      // Mock unauthenticated state
      Object.defineProperty(authServiceSpy, 'isAuthenticated$', {
        writable: true,
        value: of(false)
      });

      guard.canActivate().subscribe(result => {
        expect(result).toBeTruthy();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('should redirect to home when user is authenticated', (done) => {
      // Mock authenticated state
      Object.defineProperty(authServiceSpy, 'isAuthenticated$', {
        writable: true,
        value: of(true)
      });

      guard.canActivate().subscribe(result => {
        expect(result).toBeFalsy();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });
  });
});