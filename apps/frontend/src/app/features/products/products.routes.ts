import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

export const productsRoutes: Routes = [
  {
    path: '',
    component: ProductListComponent,
    title: 'Products',
    data: {
      breadcrumb: 'All Products'
    }
  },
  {
    path: 'category/:categoryId',
    component: ProductListComponent,
    title: 'Products by Category',
    data: {
      breadcrumb: 'Category Products'
    }
  },
  {
    path: ':productId',
    component: ProductDetailComponent,
    title: 'Product Details',
    data: {
      breadcrumb: 'Product Details'
    }
  }
];