import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    data: {
      breadcrumb: 'Authentication'
    }
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes),
    data: {
      breadcrumb: 'Products'
    }
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then(m => m.cartRoutes),
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Shopping Cart'
    }
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes),
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Orders'
    }
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
    title: 'Profile',
    data: {
      breadcrumb: 'Profile'
    }
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    title: 'Dashboard',
    data: {
      breadcrumb: 'Dashboard'
    }
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Admin Panel'
    }
  },
  {
    path: 'help',
    loadComponent: () => import('./shared/components/help/help.component').then(m => m.HelpComponent),
    title: 'Help Center',
    data: {
      breadcrumb: 'Help Center'
    }
  },
  {
    path: 'about',
    loadComponent: () => import('./shared/components/about/about.component').then(m => m.AboutComponent),
    title: 'About Us',
    data: {
      breadcrumb: 'About Us'
    }
  },
  {
    path: 'contact',
    loadComponent: () => import('./shared/components/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact',
    data: {
      breadcrumb: 'Contact'
    }
  },
  {
    path: 'not-found',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found'
  },
  {
    path: 'error',
    loadComponent: () => import('./shared/components/error/error.component').then(m => m.ErrorComponent),
    title: 'Error'
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];
