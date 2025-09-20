import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }

  return null;
}

// Custom validator for password strength
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) {
    return null;
  }

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const isValidLength = value.length >= 8;

  const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && isValidLength;

  if (!passwordValid) {
    return { passwordStrength: true };
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Join us today! Create your account to get started.</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="firstName"
                  placeholder="Enter your first name"
                  [class.mat-form-field-invalid]="firstName?.invalid && firstName?.touched"
                >
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="firstName?.hasError('required')">
                  First name is required
                </mat-error>
                <mat-error *ngIf="firstName?.hasError('minlength')">
                  First name must be at least 2 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="lastName"
                  placeholder="Enter your last name"
                  [class.mat-form-field-invalid]="lastName?.invalid && lastName?.touched"
                >
                <mat-error *ngIf="lastName?.hasError('required')">
                  Last name is required
                </mat-error>
                <mat-error *ngIf="lastName?.hasError('minlength')">
                  Last name must be at least 2 characters
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="Enter your email"
                [class.mat-form-field-invalid]="email?.invalid && email?.touched"
              >
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="email?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="email?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Create a strong password"
                [class.mat-form-field-invalid]="password?.invalid && password?.touched"
              >
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="password?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="password?.hasError('passwordStrength')">
                Password must contain at least 8 characters, including uppercase, lowercase, and a number
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                [type]="hideConfirmPassword ? 'password' : 'text'"
                formControlName="confirmPassword"
                placeholder="Re-enter your password"
                [class.mat-form-field-invalid]="confirmPassword?.invalid && confirmPassword?.touched"
              >
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hideConfirmPassword = !hideConfirmPassword"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hideConfirmPassword"
              >
                <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="confirmPassword?.hasError('required')">
                Please confirm your password
              </mat-error>
              <mat-error *ngIf="registerForm.hasError('passwordMismatch') && confirmPassword?.touched">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
                class="full-width"
              >
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <span *ngIf="!isLoading">Create Account</span>
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <p class="login-link">
            Already have an account?
            <a [routerLink]="['/auth/login']" class="link">Sign in here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .register-card {
      width: 100%;
      max-width: 500px;
      padding: 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .name-row {
      display: flex;
      gap: 16px;
      margin-bottom: 0;
    }

    .half-width {
      flex: 1;
      margin-bottom: 16px;
    }

    .form-actions {
      margin-top: 24px;
    }

    .login-link {
      margin: 16px 0 0 0;
      text-align: center;
      font-size: 14px;
    }

    .link {
      color: #3f51b5;
      text-decoration: none;
    }

    .link:hover {
      text-decoration: underline;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 500;
    }

    mat-card-subtitle {
      font-size: 14px;
      color: rgba(0,0,0,0.6);
    }

    @media (max-width: 600px) {
      .name-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;

      const { confirmPassword, ...userData } = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Account created successfully! Welcome!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.error || 'Registration failed. Please try again.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}