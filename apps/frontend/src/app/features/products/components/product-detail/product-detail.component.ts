import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { ImageGalleryComponent } from '../../../../shared/components/image-gallery/image-gallery.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    ImageGalleryComponent
  ],
  template: `
    <div class="product-detail-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner diameter="60" mode="indeterminate"></mat-progress-spinner>
        <p>Loading product details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h2>Product not found</h2>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" routerLink="/products">
          <mat-icon>arrow_back</mat-icon>
          Back to Products
        </button>
      </div>

      <!-- Product Details -->
      <div *ngIf="product && !loading && !error" class="product-content">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a routerLink="/products" class="breadcrumb-link">Products</a>
          <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          <span *ngIf="product.category" class="breadcrumb-link">{{ product.category }}</span>
          <mat-icon *ngIf="product.category" class="breadcrumb-separator">chevron_right</mat-icon>
          <span class="breadcrumb-current">{{ product.name }}</span>
        </nav>

        <div class="product-layout">
          <!-- Product Images -->
          <div class="product-images">
            <app-image-gallery
              [images]="product.images"
              [altText]="product.name"
              (imageChange)="onImageChange($event)">
            </app-image-gallery>
          </div>

          <!-- Product Information -->
          <div class="product-info">
            <div class="product-header">
              <h1 class="product-title">{{ product.name }}</h1>

              <div class="product-meta">
                <div class="price-section">
                  <span class="price">\${{ product.price | number:'1.2-2' }}</span>
                </div>

                <div class="stock-section">
                  <mat-chip
                    [color]="productService.getStockStatusColor(product)"
                    class="stock-chip">
                    <mat-icon>{{ getStockIcon() }}</mat-icon>
                    {{ productService.getStockStatus(product) }}
                  </mat-chip>

                  <span *ngIf="product.inventory <= 5 && product.inventory > 0" class="inventory-warning">
                    Only {{ product.inventory }} left in stock
                  </span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Product Description -->
            <div class="product-description">
              <h3>Description</h3>
              <p>{{ product.description }}</p>
            </div>

            <!-- Product Actions -->
            <div class="product-actions">
              <div class="quantity-selector" *ngIf="productService.isInStock(product)">
                <mat-form-field appearance="outline">
                  <mat-label>Quantity</mat-label>
                  <mat-select [formControl]="quantityControl">
                    <mat-option *ngFor="let qty of getAvailableQuantities()" [value]="qty">
                      {{ qty }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="action-buttons">
                <button
                  mat-raised-button
                  color="primary"
                  class="add-to-cart-btn"
                  [disabled]="!productService.isInStock(product)"
                  (click)="addToCart()"
                  matTooltip="Add to Cart">
                  <mat-icon>add_shopping_cart</mat-icon>
                  Add to Cart
                </button>

                <button
                  mat-stroked-button
                  color="primary"
                  class="buy-now-btn"
                  [disabled]="!productService.isInStock(product)"
                  (click)="buyNow()"
                  matTooltip="Buy Now">
                  <mat-icon>flash_on</mat-icon>
                  Buy Now
                </button>

                <button
                  mat-icon-button
                  class="favorite-btn"
                  [color]="isFavorite ? 'warn' : ''"
                  (click)="toggleFavorite()"
                  [matTooltip]="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'">
                  <mat-icon>{{ isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
                </button>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Product Details Tabs -->
            <mat-tab-group class="product-tabs">
              <mat-tab label="Specifications">
                <div class="tab-content">
                  <div class="spec-grid">
                    <div class="spec-item">
                      <span class="spec-label">Category:</span>
                      <span class="spec-value">{{ product.category }}</span>
                    </div>

                    <div class="spec-item" *ngIf="product.weight">
                      <span class="spec-label">Weight:</span>
                      <span class="spec-value">{{ product.weight }} lbs</span>
                    </div>

                    <div class="spec-item" *ngIf="product.dimensions">
                      <span class="spec-label">Dimensions:</span>
                      <span class="spec-value">
                        {{ product.dimensions.length }}" ×
                        {{ product.dimensions.width }}" ×
                        {{ product.dimensions.height }}"
                      </span>
                    </div>

                    <div class="spec-item">
                      <span class="spec-label">Product ID:</span>
                      <span class="spec-value">{{ product._id }}</span>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <mat-tab label="Tags" *ngIf="product.tags?.length">
                <div class="tab-content">
                  <div class="tags-container">
                    <mat-chip-set>
                      <mat-chip *ngFor="let tag of product.tags">{{ tag }}</mat-chip>
                    </mat-chip-set>
                  </div>
                </div>
              </mat-tab>

              <mat-tab label="Shipping & Returns">
                <div class="tab-content">
                  <div class="shipping-info">
                    <h4>Shipping Information</h4>
                    <ul>
                      <li>Free standard shipping on orders over $50</li>
                      <li>Express shipping available</li>
                      <li>Ships within 1-2 business days</li>
                      <li>Estimated delivery: 3-7 business days</li>
                    </ul>

                    <h4>Return Policy</h4>
                    <ul>
                      <li>30-day return policy</li>
                      <li>Items must be in original condition</li>
                      <li>Return shipping fees may apply</li>
                      <li>Refunds processed within 5-7 business days</li>
                    </ul>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px;
      min-height: 100vh;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      font-size: 14px;
    }

    .breadcrumb-link {
      color: #1976d2;
      text-decoration: none;
    }

    .breadcrumb-link:hover {
      text-decoration: underline;
    }

    .breadcrumb-separator {
      margin: 0 8px;
      font-size: 16px;
      color: #666;
    }

    .breadcrumb-current {
      color: #666;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: start;
    }

    .product-images {
      position: sticky;
      top: 24px;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .product-header {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .product-title {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
      line-height: 1.2;
      color: #333;
    }

    .product-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .price-section .price {
      font-size: 36px;
      font-weight: 700;
      color: #1976d2;
    }

    .stock-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stock-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .inventory-warning {
      color: #f57c00;
      font-weight: 500;
      font-size: 14px;
    }

    .product-description h3 {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .product-description p {
      margin: 0;
      line-height: 1.6;
      color: #666;
    }

    .product-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .quantity-selector {
      max-width: 120px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .add-to-cart-btn,
    .buy-now-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
    }

    .add-to-cart-btn {
      flex: 1;
      max-width: 200px;
    }

    .buy-now-btn {
      flex: 1;
      max-width: 150px;
    }

    .favorite-btn {
      flex-shrink: 0;
    }

    .product-tabs {
      margin-top: 16px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .spec-grid {
      display: grid;
      gap: 16px;
    }

    .spec-item {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .spec-label {
      font-weight: 600;
      color: #333;
    }

    .spec-value {
      color: #666;
    }

    .tags-container {
      padding: 8px 0;
    }

    .shipping-info h4 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .shipping-info ul {
      margin: 0 0 24px 0;
      padding-left: 20px;
    }

    .shipping-info li {
      margin-bottom: 8px;
      color: #666;
      line-height: 1.5;
    }

    @media (max-width: 968px) {
      .product-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .product-images {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .product-detail-container {
        padding: 8px;
      }

      .product-title {
        font-size: 24px;
      }

      .price-section .price {
        font-size: 28px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .add-to-cart-btn,
      .buy-now-btn {
        width: 100%;
        max-width: none;
      }

      .breadcrumb-current {
        max-width: 120px;
      }
    }

    @media (max-width: 480px) {
      .product-layout {
        gap: 24px;
      }

      .product-info {
        gap: 16px;
      }

      .tab-content {
        padding: 16px 0;
      }

      .spec-item {
        grid-template-columns: 1fr;
        gap: 4px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = false;
  error: string | null = null;
  quantityControl = new FormControl(1, [Validators.required, Validators.min(1)]);
  isFavorite = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const productId = params['productId'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(id: string) {
    this.loading = true;
    this.error = null;

    this.productService.getProduct(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        this.setupQuantityControl();
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  private setupQuantityControl() {
    if (this.product) {
      const maxQuantity = Math.min(this.product.inventory, 10);
      this.quantityControl.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(maxQuantity)
      ]);
      this.quantityControl.updateValueAndValidity();
    }
  }

  getAvailableQuantities(): number[] {
    if (!this.product) return [1];

    const maxQuantity = Math.min(this.product.inventory, 10);
    return Array.from({ length: maxQuantity }, (_, i) => i + 1);
  }

  getStockIcon(): string {
    if (!this.product) return 'help';

    if (!this.product.isActive) return 'cancel';
    if (this.product.inventory === 0) return 'remove_circle_outline';
    if (this.product.inventory <= 5) return 'warning';
    return 'check_circle';
  }

  addToCart() {
    if (this.product && this.productService.isInStock(this.product)) {
      const quantity = this.quantityControl.value || 1;
      console.log('Add to cart:', this.product, 'Quantity:', quantity);
      // TODO: Integrate with cart service
    }
  }

  buyNow() {
    if (this.product && this.productService.isInStock(this.product)) {
      const quantity = this.quantityControl.value || 1;
      console.log('Buy now:', this.product, 'Quantity:', quantity);
      // TODO: Implement buy now functionality
    }
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    // TODO: Integrate with favorites service
    console.log('Toggle favorite:', this.product, 'Is favorite:', this.isFavorite);
  }

  onImageChange(event: {index: number, image: string}) {
    console.log('Image changed:', event);
  }
}