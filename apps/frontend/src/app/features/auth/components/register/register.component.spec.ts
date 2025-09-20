import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockAuthResponse = {
    message: 'Registration successful',
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
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: MatSnackBar, useValue: snackBarSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('should require all fields', () => {
    expect(component.firstName?.hasError('required')).toBeTruthy();
    expect(component.lastName?.hasError('required')).toBeTruthy();
    expect(component.email?.hasError('required')).toBeTruthy();
    expect(component.password?.hasError('required')).toBeTruthy();
    expect(component.confirmPassword?.hasError('required')).toBeTruthy();
    expect(component.registerForm.invalid).toBeTruthy();
  });

  it('should validate first name minimum length', () => {
    component.registerForm.get('firstName')?.setValue('J');

    expect(component.firstName?.hasError('minlength')).toBeTruthy();
  });

  it('should validate last name minimum length', () => {
    component.registerForm.get('lastName')?.setValue('D');

    expect(component.lastName?.hasError('minlength')).toBeTruthy();
  });

  it('should validate email format', () => {
    component.registerForm.get('email')?.setValue('invalid-email');

    expect(component.email?.hasError('email')).toBeTruthy();
  });

  it('should validate password strength', () => {
    // Test weak password (no uppercase)
    component.registerForm.get('password')?.setValue('password123');
    expect(component.password?.hasError('passwordStrength')).toBeTruthy();

    // Test weak password (no lowercase)
    component.registerForm.get('password')?.setValue('PASSWORD123');
    expect(component.password?.hasError('passwordStrength')).toBeTruthy();

    // Test weak password (no number)
    component.registerForm.get('password')?.setValue('Password');
    expect(component.password?.hasError('passwordStrength')).toBeTruthy();

    // Test weak password (too short)
    component.registerForm.get('password')?.setValue('Pass1');
    expect(component.password?.hasError('passwordStrength')).toBeTruthy();

    // Test strong password
    component.registerForm.get('password')?.setValue('Password123!');
    expect(component.password?.hasError('passwordStrength')).toBeFalsy();
  });

  it('should validate password confirmation match', () => {
    component.registerForm.patchValue({
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!'
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
  });

  it('should be valid with correct inputs', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });

    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should call AuthService.register on form submit', () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'Password123!'
    };

    component.registerForm.patchValue({
      ...userData,
      confirmPassword: 'Password123!'
    });
    authServiceSpy.register.and.returnValue(of(mockAuthResponse));

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith(userData);
  });

  it('should navigate on successful registration', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    authServiceSpy.register.and.returnValue(of(mockAuthResponse));

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Account created successfully! Welcome!',
      'Close',
      jasmine.objectContaining({
        duration: 3000,
        panelClass: ['success-snackbar']
      })
    );
  });

  it('should show error message on registration failure', () => {
    const errorResponse = {
      error: { error: 'Email already exists' }
    };

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'existing@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Email already exists',
      'Close',
      jasmine.objectContaining({
        duration: 5000,
        panelClass: ['error-snackbar']
      })
    );
  });

  it('should show default error message when no specific error provided', () => {
    const errorResponse = {};

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Registration failed. Please try again.',
      'Close',
      jasmine.objectContaining({
        duration: 5000,
        panelClass: ['error-snackbar']
      })
    );
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTruthy();
    expect(component.hideConfirmPassword).toBeTruthy();

    component.hidePassword = !component.hidePassword;
    component.hideConfirmPassword = !component.hideConfirmPassword;

    expect(component.hidePassword).toBeFalsy();
    expect(component.hideConfirmPassword).toBeFalsy();
  });

  it('should disable submit button when form is invalid', () => {
    component.registerForm.patchValue({
      firstName: 'J',
      lastName: 'D',
      email: 'invalid-email',
      password: '123',
      confirmPassword: '456'
    });

    expect(component.registerForm.invalid).toBeTruthy();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTruthy();
  });

  it('should disable submit button when loading', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    component.isLoading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTruthy();
  });

  it('should not submit form when invalid', () => {
    component.registerForm.patchValue({
      firstName: 'J',
      lastName: 'D',
      email: 'invalid-email',
      password: '123',
      confirmPassword: '456'
    });

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should exclude confirmPassword from registration data', () => {
    const expectedUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'Password123!'
    };

    component.registerForm.patchValue({
      ...expectedUserData,
      confirmPassword: 'Password123!'
    });
    authServiceSpy.register.and.returnValue(of(mockAuthResponse));

    component.onSubmit();

    // Ensure confirmPassword is not included in the API call
    expect(authServiceSpy.register).toHaveBeenCalledWith(expectedUserData);
    expect(authServiceSpy.register).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ confirmPassword: jasmine.any(String) })
    );
  });
});