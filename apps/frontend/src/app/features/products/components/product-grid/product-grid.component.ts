import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Product, ProductListResponse } from '../../interfaces/product.interface';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../../../shared/components/loading-skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    ProductCardComponent,
    ProductCardSkeletonComponent
  ],
  template: `
    <div class="product-grid-container">
      <!-- Loading State -->
      <div *ngIf="loading && !products?.length" class="loading-container">
        <mat-grid-list [cols]="columns" gutterSize="16px">
          <mat-grid-tile *ngFor="let item of skeletonArray">
            <app-product-card-skeleton></app-product-card-skeleton>
          </mat-grid-tile>
        </mat-grid-list>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>Unable to load products</h3>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="onRetry()">
          <mat-icon>refresh</mat-icon>
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && products?.length === 0" class="empty-container">
        <mat-icon class="empty-icon">inventory_2</mat-icon>
        <h3>No products found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>

      <!-- Products Grid -->
      <div *ngIf="products?.length && !error" class="products-container">
        <mat-grid-list [cols]="columns" gutterSize="16px" [rowHeight]="rowHeight">
          <mat-grid-tile *ngFor="let product of products; trackBy: trackByProduct">
            <app-product-card
              [product]="product"
              (addToCart)="onAddToCart($event)"
              (quickView)="onQuickView($event)">
            </app-product-card>
          </mat-grid-tile>
        </mat-grid-list>

        <!-- Loading more products -->
        <div *ngIf="loading" class="loading-more">
          <mat-progress-spinner diameter="40" mode="indeterminate"></mat-progress-spinner>
          <span>Loading more products...</span>
        </div>

        <!-- Pagination -->
        <mat-paginator
          *ngIf="productResponse"
          [length]="productResponse.totalCount"
          [pageSize]="pageSize"
          [pageIndex]="productResponse.currentPage - 1"
          [pageSizeOptions]="pageSizeOptions"
          [showFirstLastButtons]="true"
          (page)="onPageChange($event)"
          class="product-paginator">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .product-grid-container {
      padding: 16px;
    }

    .loading-container,
    .error-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
    }

    .error-icon,
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #666;
      margin-bottom: 16px;
    }

    .error-container h3,
    .empty-container h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .error-container p,
    .empty-container p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .products-container {
      position: relative;
    }

    .loading-more {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 16px;
    }

    .loading-more span {
      color: #666;
      font-size: 14px;
    }

    .product-paginator {
      margin-top: 32px;
      background: transparent;
    }

    mat-grid-tile {
      overflow: visible;
    }

    mat-grid-tile > * {
      width: 100%;
      height: 100%;
    }

    @media (max-width: 599px) {
      .product-grid-container {
        padding: 8px;
      }
    }

    @media (max-width: 768px) {
      .loading-more {
        padding: 16px;
      }

      .product-paginator {
        margin-top: 16px;
      }
    }
  `]
})
export class ProductGridComponent implements OnInit {
  @Input() products: Product[] = [];
  @Input() productResponse: ProductListResponse | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() pageSize = 12;
  @Input() pageSizeOptions = [6, 12, 24, 48];

  @Output() addToCart = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() retry = new EventEmitter<void>();

  columns = 4;
  rowHeight = '420px';
  skeletonArray = Array(12).fill(0);

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.setupResponsiveGrid();
  }

  private setupResponsiveGrid() {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,     // < 600px
      Breakpoints.Small,      // 600px - 959px
      Breakpoints.Medium,     // 960px - 1279px
      Breakpoints.Large,      // 1280px - 1919px
      Breakpoints.XLarge      // >= 1920px
    ]).pipe(
      map(result => {
        if (result.matches) {
          if (result.breakpoints[Breakpoints.XSmall]) {
            return { cols: 1, rowHeight: '380px' };
          }
          if (result.breakpoints[Breakpoints.Small]) {
            return { cols: 2, rowHeight: '400px' };
          }
          if (result.breakpoints[Breakpoints.Medium]) {
            return { cols: 3, rowHeight: '420px' };
          }
          if (result.breakpoints[Breakpoints.Large]) {
            return { cols: 4, rowHeight: '420px' };
          }
          if (result.breakpoints[Breakpoints.XLarge]) {
            return { cols: 5, rowHeight: '420px' };
          }
        }
        return { cols: 4, rowHeight: '420px' };
      })
    ).subscribe(gridSettings => {
      this.columns = gridSettings.cols;
      this.rowHeight = gridSettings.rowHeight;
      this.skeletonArray = Array(this.columns * 3).fill(0);
    });
  }

  onAddToCart(product: Product) {
    this.addToCart.emit(product);
  }

  onQuickView(product: Product) {
    this.quickView.emit(product);
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onRetry() {
    this.retry.emit();
  }

  trackByProduct(index: number, product: Product): string {
    return product._id;
  }
}