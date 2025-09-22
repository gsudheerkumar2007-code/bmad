import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser$: Observable<User | null>;
  isHandset$: Observable<boolean>;
  cartItemCount = 0; // Will be connected to cart service in future story

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );

    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Cart service integration will be implemented in future story
    // When cart service is available, add subscription here
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(searchTerm: string): void {
    if (searchTerm.trim()) {
      // Search functionality will be implemented in products feature story
      // For now, this is a placeholder for the search interface
    }
  }

  logout(): void {
    this.authService.logout();
  }

  onCartClick(): void {
    // Cart navigation will be implemented when cart feature is available
    // This provides the UI foundation for cart functionality
  }
}