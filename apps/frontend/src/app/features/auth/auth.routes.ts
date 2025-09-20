import { Routes } from '@angular/router';
import { GuestGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard],
    title: 'Sign In'
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard],
    title: 'Create Account'
  }
];