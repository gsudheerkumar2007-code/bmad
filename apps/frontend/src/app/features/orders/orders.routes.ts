import { Routes } from '@angular/router';
import { Component } from '@angular/core';

// Placeholder component for orders feature - will be implemented in future stories
@Component({
  selector: 'app-orders-placeholder',
  standalone: true,
  template: `
    <div style="text-align: center; padding: 2rem;">
      <h1>Order Management</h1>
      <p>Order tracking and history features will be available soon!</p>
      <p>This placeholder ensures navigation structure works correctly.</p>
    </div>
  `
})
export class OrdersPlaceholderComponent { }

export const ordersRoutes: Routes = [
  {
    path: '',
    component: OrdersPlaceholderComponent,
    title: 'My Orders',
    data: {
      breadcrumb: 'Order History'
    }
  },
  {
    path: ':orderId',
    component: OrdersPlaceholderComponent,
    title: 'Order Details',
    data: {
      breadcrumb: 'Order Details'
    }
  },
  {
    path: ':orderId/track',
    component: OrdersPlaceholderComponent,
    title: 'Track Order',
    data: {
      breadcrumb: 'Track Order'
    }
  }
];