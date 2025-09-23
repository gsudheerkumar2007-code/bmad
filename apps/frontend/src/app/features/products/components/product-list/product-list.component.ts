import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageEvent } from '@angular/material/paginator';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Product, ProductListResponse, ProductQuery } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { ProductGridComponent } from '../product-grid/product-grid.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    ProductGridComponent
  ],
  template: `
    <div class="product-list-container">
      <!-- Header with filters and search -->
      <mat-toolbar class="product-toolbar">
        <div class="toolbar-content">
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search products</mat-label>
              <input matInput
                     [formControl]="searchControl"
                     placeholder="Search by name or description...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="filter-section">
            <mat-form-field appearance="outline" class="sort-field">
              <mat-label>Sort by</mat-label>
              <mat-select [formControl]="sortControl">
                <mat-option value="name">Name (A-Z)</mat-option>
                <mat-option value="-name">Name (Z-A)</mat-option>
                <mat-option value="price">Price (Low to High)</mat-option>
                <mat-option value="-price">Price (High to Low)</mat-option>
                <mat-option value="-createdAt">Newest First</mat-option>
                <mat-option value="createdAt">Oldest First</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button
                    [matTooltip]="isGridView ? 'List View' : 'Grid View'"
                    (click)="toggleView()">
              <mat-icon>{{ isGridView ? 'view_list' : 'view_module' }}</mat-icon>
            </button>
          </div>
        </div>

        <!-- Active filters -->
        <div class="active-filters" *ngIf="hasActiveFilters()">
          <mat-chip-set>
            <mat-chip *ngIf="currentQuery.filters?.category"
                      removable
                      (removed)="removeFilter('category')">
              Category: {{ currentQuery.filters?.category }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>

            <mat-chip *ngIf="currentQuery.filters?.search"
                      removable
                      (removed)="removeFilter('search')">
              Search: "{{ currentQuery.filters?.search }}"
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>

            <mat-chip *ngIf="currentQuery.filters?.minPrice || currentQuery.filters?.maxPrice"
                      removable
                      (removed)="removeFilter('price')">
              Price: {{ getPriceRangeText() }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>

            <button mat-button
                    color="warn"
                    (click)="clearAllFilters()"
                    *ngIf="hasActiveFilters()">
              Clear All Filters
            </button>
          </mat-chip-set>
        </div>
      </mat-toolbar>

      <!-- Results info -->
      <div class="results-info" *ngIf="productResponse">
        <span class="results-count">
          Showing {{ getResultsRange() }} of {{ productResponse.totalCount }} products
        </span>
        <span class="page-info" *ngIf="productResponse.totalPages > 1">
          (Page {{ productResponse.currentPage }} of {{ productResponse.totalPages }})
        </span>
      </div>

      <!-- Product Grid -->
      <app-product-grid
        [products]="products"
        [productResponse]="productResponse"
        [loading]="loading"
        [error]="error"
        [pageSize]="pageSize"
        (addToCart)="onAddToCart($event)"
        (quickView)="onQuickView($event)"
        (pageChange)="onPageChange($event)"
        (retry)="loadProducts()">
      </app-product-grid>
    </div>
  `,
  styles: [`
    .product-list-container {
      min-height: 100vh;
    }

    .product-toolbar {
      background: white;
      color: inherit;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 16px;
    }

    .search-section {
      flex: 1;
      max-width: 400px;
    }

    .search-field {
      width: 100%;
    }

    .filter-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sort-field {
      min-width: 200px;
    }

    .active-filters {
      width: 100%;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .results-info {
      padding: 0 16px 16px;
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .results-count {
      font-weight: 500;
    }

    .page-info {
      color: #999;
    }

    mat-chip-set {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    @media (max-width: 768px) {
      .toolbar-content {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .filter-section {
        justify-content: space-between;
      }

      .sort-field {
        min-width: unset;
        flex: 1;
      }

      .results-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }

    @media (max-width: 599px) {
      .product-toolbar {
        padding: 8px;
      }

      .results-info {
        padding: 0 8px 8px;
      }
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  productResponse: ProductListResponse | null = null;
  loading = false;
  error: string | null = null;
  isGridView = true;
  pageSize = 12;

  searchControl = new FormControl('');
  sortControl = new FormControl('-createdAt');

  currentQuery: ProductQuery = {
    page: 1,
    limit: this.pageSize,
    sort: '-createdAt',
    filters: {}
  };

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupQueryParams();
    this.setupSearchControl();
    this.setupSortControl();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupQueryParams() {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.currentQuery = {
        page: parseInt(params['page']) || 1,
        limit: parseInt(params['limit']) || this.pageSize,
        sort: params['sort'] || '-createdAt',
        filters: {
          category: params['category'] || undefined,
          search: params['search'] || undefined,
          minPrice: params['minPrice'] ? parseFloat(params['minPrice']) : undefined,
          maxPrice: params['maxPrice'] ? parseFloat(params['maxPrice']) : undefined,
          inStock: params['inStock'] === 'true' ? true : undefined
        }
      };

      this.searchControl.setValue(this.currentQuery.filters?.search || '', { emitEvent: false });
      this.sortControl.setValue(this.currentQuery.sort || '-createdAt', { emitEvent: false });
    });
  }

  private setupSearchControl() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.updateQuery({
        page: 1,
        filters: {
          ...this.currentQuery.filters,
          search: searchTerm || undefined
        }
      });
    });
  }

  private setupSortControl() {
    this.sortControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(sort => {
      this.updateQuery({
        page: 1,
        sort: sort || '-createdAt'
      });
    });
  }

  private updateQuery(updates: Partial<ProductQuery>) {
    this.currentQuery = { ...this.currentQuery, ...updates };
    this.updateUrl();
    this.loadProducts();
  }

  private updateUrl() {
    const queryParams: any = {};

    if (this.currentQuery.page && this.currentQuery.page > 1) {
      queryParams.page = this.currentQuery.page;
    }
    if (this.currentQuery.sort !== '-createdAt') {
      queryParams.sort = this.currentQuery.sort;
    }
    if (this.currentQuery.filters?.category) {
      queryParams.category = this.currentQuery.filters.category;
    }
    if (this.currentQuery.filters?.search) {
      queryParams.search = this.currentQuery.filters.search;
    }
    if (this.currentQuery.filters?.minPrice) {
      queryParams.minPrice = this.currentQuery.filters.minPrice;
    }
    if (this.currentQuery.filters?.maxPrice) {
      queryParams.maxPrice = this.currentQuery.filters.maxPrice;
    }
    if (this.currentQuery.filters?.inStock) {
      queryParams.inStock = this.currentQuery.filters.inStock;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  loadProducts() {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(this.currentQuery).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.productResponse = response;
        this.products = response.products;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onAddToCart(product: Product) {
    console.log('Add to cart:', product);
    // TODO: Integrate with cart service
  }

  onQuickView(product: Product) {
    this.router.navigate(['/products', product._id]);
  }

  onPageChange(event: PageEvent) {
    this.updateQuery({
      page: event.pageIndex + 1,
      limit: event.pageSize
    });
  }

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  hasActiveFilters(): boolean {
    const filters = this.currentQuery.filters;
    return !!(filters?.category || filters?.search || filters?.minPrice || filters?.maxPrice);
  }

  removeFilter(filterType: string) {
    const filters = { ...this.currentQuery.filters };

    switch (filterType) {
      case 'category':
        delete filters.category;
        break;
      case 'search':
        delete filters.search;
        this.searchControl.setValue('', { emitEvent: false });
        break;
      case 'price':
        delete filters.minPrice;
        delete filters.maxPrice;
        break;
    }

    this.updateQuery({ page: 1, filters });
  }

  clearAllFilters() {
    this.searchControl.setValue('', { emitEvent: false });
    this.updateQuery({
      page: 1,
      filters: {}
    });
  }

  getResultsRange(): string {
    if (!this.productResponse) return '';

    const start = (this.productResponse.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(start + this.products.length - 1, this.productResponse.totalCount);

    return `${start}-${end}`;
  }

  getPriceRangeText(): string {
    const minPrice = this.currentQuery.filters?.minPrice || 0;
    const maxPrice = this.currentQuery.filters?.maxPrice || '∞';
    return `$${minPrice} - $${maxPrice}`;
  }
}