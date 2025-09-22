import { Routes } from '@angular/router';
import { Component } from '@angular/core';

// Placeholder component for products feature - will be implemented in future stories
@Component({
  selector: 'app-products-placeholder',
  standalone: true,
  template: `
    <div style="text-align: center; padding: 2rem;">
      <h1>Products</h1>
      <p>Products feature will be available soon!</p>
      <p>This placeholder ensures navigation structure works correctly.</p>
    </div>
  `
})
export class ProductsPlaceholderComponent { }

export const productsRoutes: Routes = [
  {
    path: '',
    component: ProductsPlaceholderComponent,
    title: 'Products',
    data: {
      breadcrumb: 'All Products'
    }
  },
  {
    path: 'category/:categoryId',
    component: ProductsPlaceholderComponent,
    title: 'Products by Category',
    data: {
      breadcrumb: 'Category Products'
    }
  },
  {
    path: ':productId',
    component: ProductsPlaceholderComponent,
    title: 'Product Details',
    data: {
      breadcrumb: 'Product Details'
    }
  }
];