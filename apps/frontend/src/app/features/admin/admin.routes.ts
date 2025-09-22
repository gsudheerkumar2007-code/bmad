import { Routes } from '@angular/router';
import { Component } from '@angular/core';

// Placeholder component for admin feature - will be implemented in future stories
@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  template: `
    <div style="text-align: center; padding: 2rem;">
      <h1>Admin Panel</h1>
      <p>Administrative features will be available soon!</p>
      <p>This placeholder ensures navigation structure works correctly.</p>
    </div>
  `
})
export class AdminPlaceholderComponent { }

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminPlaceholderComponent,
    title: 'Admin Dashboard',
    data: {
      breadcrumb: 'Dashboard'
    }
  },
  {
    path: 'products',
    component: AdminPlaceholderComponent,
    title: 'Product Management',
    data: {
      breadcrumb: 'Manage Products'
    }
  },
  {
    path: 'orders',
    component: AdminPlaceholderComponent,
    title: 'Order Management',
    data: {
      breadcrumb: 'Manage Orders'
    }
  },
  {
    path: 'users',
    component: AdminPlaceholderComponent,
    title: 'User Management',
    data: {
      breadcrumb: 'Manage Users'
    }
  }
];