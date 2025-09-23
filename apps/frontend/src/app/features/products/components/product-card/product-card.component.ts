import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    RouterLink
  ],
  template: `
    <mat-card
      class="product-card"
      [class.out-of-stock]="!productService.isInStock(product)"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()">

      <div class="image-container" [routerLink]="['/products', product._id]">
        <img
          [src]="currentImage"
          [alt]="product.name"
          class="product-image"
          (error)="onImageError($event)"
          loading="lazy">

        <div class="image-overlay" [class.visible]="isHovered">
          <button
            mat-mini-fab
            color="primary"
            class="quick-view-btn"
            matTooltip="Quick View"
            (click)="onQuickView($event)">
            <mat-icon>visibility</mat-icon>
          </button>
        </div>

        <div class="stock-indicator">
          <mat-chip
            [color]="productService.getStockStatusColor(product)"
            class="stock-chip">
            {{ productService.getStockStatus(product) }}
          </mat-chip>
        </div>
      </div>

      <mat-card-content class="card-content">
        <h3 class="product-name" [routerLink]="['/products', product._id]">
          {{ product.name }}
        </h3>

        <p class="product-description">
          {{ product.description | slice:0:100 }}{{ product.description.length > 100 ? '...' : '' }}
        </p>

        <div class="product-meta">
          <span class="price">\${{ product.price | number:'1.2-2' }}</span>
          <span class="inventory" *ngIf="product.inventory <= 5 && product.inventory > 0">
            Only {{ product.inventory }} left
          </span>
        </div>

        <div class="card-actions">
          <button
            mat-stroked-button
            color="primary"
            [routerLink]="['/products', product._id]">
            View Details
          </button>

          <button
            mat-raised-button
            color="primary"
            [disabled]="!productService.isInStock(product)"
            (click)="onAddToCart()"
            matTooltip="Add to Cart">
            <mat-icon>add_shopping_cart</mat-icon>
            Add to Cart
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .product-card {
      position: relative;
      height: 420px;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      cursor: pointer;
      overflow: hidden;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .product-card.out-of-stock {
      opacity: 0.7;
    }

    .image-container {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .image-overlay.visible {
      opacity: 1;
    }

    .quick-view-btn {
      transform: translateY(20px);
      transition: transform 0.3s ease;
    }

    .image-overlay.visible .quick-view-btn {
      transform: translateY(0);
    }

    .stock-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .stock-chip {
      font-size: 12px;
      height: 24px;
    }

    .card-content {
      padding: 16px;
      height: 220px;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      line-height: 1.2;
      height: 44px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .product-name:hover {
      color: #1976d2;
    }

    .product-description {
      color: #666;
      font-size: 14px;
      line-height: 1.4;
      margin: 0 0 12px 0;
      flex: 1;
      overflow: hidden;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .price {
      font-size: 20px;
      font-weight: 600;
      color: #1976d2;
    }

    .inventory {
      font-size: 12px;
      color: #f57c00;
      font-weight: 500;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      justify-content: space-between;
    }

    .card-actions button {
      flex: 1;
    }

    @media (max-width: 768px) {
      .product-card {
        height: 380px;
      }

      .card-content {
        height: 180px;
        padding: 12px;
      }

      .product-name {
        font-size: 16px;
        height: 36px;
      }

      .card-actions {
        flex-direction: column;
      }

      .card-actions button {
        width: 100%;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();

  isHovered = false;
  currentImage = '';

  constructor(public productService: ProductService) {}

  ngOnInit() {
    this.currentImage = this.product.images?.[0] || '/assets/images/product-placeholder.svg';
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  onAddToCart() {
    if (this.productService.isInStock(this.product)) {
      this.addToCart.emit(this.product);
    }
  }

  onQuickView(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.quickView.emit(this.product);
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/product-placeholder.svg';
  }
}