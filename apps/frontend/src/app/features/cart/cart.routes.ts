import { Routes } from '@angular/router';
import { Component } from '@angular/core';

// Placeholder component for cart feature - will be implemented in future stories
@Component({
  selector: 'app-cart-placeholder',
  standalone: true,
  template: `
    <div style="text-align: center; padding: 2rem;">
      <h1>Shopping Cart</h1>
      <p>Cart and checkout features will be available soon!</p>
      <p>This placeholder ensures navigation structure works correctly.</p>
    </div>
  `
})
export class CartPlaceholderComponent { }

export const cartRoutes: Routes = [
  {
    path: '',
    component: CartPlaceholderComponent,
    title: 'Shopping Cart',
    data: {
      breadcrumb: 'My Cart'
    }
  },
  {
    path: 'checkout',
    component: CartPlaceholderComponent,
    title: 'Checkout',
    data: {
      breadcrumb: 'Checkout'
    }
  },
  {
    path: 'confirmation/:orderId',
    component: CartPlaceholderComponent,
    title: 'Order Confirmation',
    data: {
      breadcrumb: 'Order Confirmed'
    }
  }
];