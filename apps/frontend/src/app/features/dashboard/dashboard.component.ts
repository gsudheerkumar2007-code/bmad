import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService, User } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>E-Commerce Dashboard</span>
      <span class="spacer"></span>
      <div class="user-info" *ngIf="currentUser$ | async as user">
        <span>Welcome, {{ user.firstName }}!</span>
        <button mat-icon-button (click)="logout()" title="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </div>
    </mat-toolbar>

    <div class="dashboard-container">
      <div class="welcome-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Welcome to your Dashboard</mat-card-title>
            <mat-card-subtitle>Your authentication system is working!</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="currentUser$ | async as user">
              <p><strong>Name:</strong> {{ user.firstName }} {{ user.lastName }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Account Type:</strong> {{ user.isAdmin ? 'Administrator' : 'User' }}</p>
              <p><strong>Member since:</strong> {{ user.createdAt | date:'mediumDate' }}</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="warn" (click)="logout()">
              <mat-icon>logout</mat-icon>
              Sign Out
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="features-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Authentication Features Implemented</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <ul class="feature-list">
              <li>✅ User Registration with validation</li>
              <li>✅ User Login with JWT tokens</li>
              <li>✅ Password hashing with bcrypt</li>
              <li>✅ Route protection with guards</li>
              <li>✅ JWT token refresh mechanism</li>
              <li>✅ Automatic token handling</li>
              <li>✅ User session management</li>
              <li>✅ Responsive Material Design forms</li>
            </ul>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section,
    .features-section {
      margin-bottom: 24px;
    }

    .feature-list {
      list-style: none;
      padding: 0;
    }

    .feature-list li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .feature-list li:last-child {
      border-bottom: none;
    }

    mat-card {
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .user-info span {
        display: none;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Refresh user data to ensure it's current
    this.authService.getCurrentUser().subscribe({
      error: (error) => {
        console.error('Failed to fetch user data:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}