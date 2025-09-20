import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockAuthResponse = {
    message: 'Login successful',
    user: {
      _id: '123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    },
    tokens: {
      accessToken: 'mock.access.token',
      refreshToken: 'mock.refresh.token'
    }
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {} }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should require email and password', () => {
    component.loginForm.get('email')?.setValue('');
    component.loginForm.get('password')?.setValue('');

    expect(component.email?.hasError('required')).toBeTruthy();
    expect(component.password?.hasError('required')).toBeTruthy();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should validate email format', () => {
    component.loginForm.get('email')?.setValue('invalid-email');

    expect(component.email?.hasError('email')).toBeTruthy();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should validate password minimum length', () => {
    component.loginForm.get('password')?.setValue('123');

    expect(component.password?.hasError('minlength')).toBeTruthy();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should be valid with correct inputs', () => {
    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('Password123!');

    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call AuthService.login on form submit', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    component.loginForm.patchValue(credentials);
    authServiceSpy.login.and.returnValue(of(mockAuthResponse));

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith(credentials);
  });

  it('should navigate on successful login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    component.loginForm.patchValue(credentials);
    authServiceSpy.login.and.returnValue(of(mockAuthResponse));

    component.onSubmit();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Login successful!',
      'Close',
      jasmine.objectContaining({
        duration: 3000,
        panelClass: ['success-snackbar']
      })
    );
  });

  it('should navigate to returnUrl if provided', () => {
    component.returnUrl = '/dashboard';
    const credentials = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    component.loginForm.patchValue(credentials);
    authServiceSpy.login.and.returnValue(of(mockAuthResponse));

    component.onSubmit();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should show error message on login failure', () => {
    const errorResponse = {
      error: { error: 'Invalid credentials' }
    };

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Invalid credentials',
      'Close',
      jasmine.objectContaining({
        duration: 5000,
        panelClass: ['error-snackbar']
      })
    );
  });

  it('should show default error message when no specific error provided', () => {
    const errorResponse = {};

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Login failed. Please try again.',
      'Close',
      jasmine.objectContaining({
        duration: 5000,
        panelClass: ['error-snackbar']
      })
    );
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTruthy();

    // Simulate clicking the visibility toggle button
    component.hidePassword = !component.hidePassword;

    expect(component.hidePassword).toBeFalsy();
  });

  it('should disable submit button when form is invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '123'
    });

    expect(component.loginForm.invalid).toBeTruthy();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTruthy();
  });

  it('should disable submit button when loading', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'Password123!'
    });
    component.isLoading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTruthy();
  });

  it('should not submit form when invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '123'
    });

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});