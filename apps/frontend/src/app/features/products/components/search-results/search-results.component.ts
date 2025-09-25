import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product, SearchFilters } from '../../interfaces/product.interface';

export interface SearchResultsData {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDividerModule,
    ProductCardComponent
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnChanges {
  @Input() results: SearchResultsData | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() filters: SearchFilters = {
    searchTerm: '',
    categories: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: 'relevance',
    sortOrder: 'desc'
  };
  @Input() showPagination = true;
  @Input() pageSize = 20;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<{ sortBy: string; sortOrder: string }>();
  @Output() productClick = new EventEmitter<Product>();
  @Output() retrySearch = new EventEmitter<void>();

  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name (A-Z)', sortOrder: 'asc' },
    { value: 'name_desc', label: 'Name (Z-A)', sortOrder: 'desc' },
    { value: 'price_asc', label: 'Price: Low to High', sortOrder: 'asc' },
    { value: 'price_desc', label: 'Price: High to Low', sortOrder: 'desc' },
    { value: 'newest', label: 'Newest First', sortOrder: 'desc' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['results'] && this.results) {
      // Scroll to top when results change
      this.scrollToTop();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
    this.scrollToTop();
  }

  onSortChange(sortValue: string): void {
    const selectedOption = this.sortOptions.find(option =>
      option.value === sortValue ||
      `${option.value}_${option.sortOrder}` === sortValue
    );

    if (selectedOption) {
      let sortBy = selectedOption.value;
      let sortOrder = selectedOption.sortOrder || 'desc';

      // Handle special cases
      if (sortValue === 'price_asc') {
        sortBy = 'price';
        sortOrder = 'asc';
      } else if (sortValue === 'price_desc') {
        sortBy = 'price';
        sortOrder = 'desc';
      } else if (sortValue === 'name_desc') {
        sortBy = 'name';
        sortOrder = 'desc';
      } else if (sortValue === 'newest') {
        sortBy = 'createdAt';
        sortOrder = 'desc';
      }

      this.sortChange.emit({ sortBy, sortOrder });
    }
  }

  onProductClick(product: Product): void {
    this.productClick.emit(product);
  }

  onRetry(): void {
    this.retrySearch.emit();
  }

  getCurrentSortValue(): string {
    const { sortBy, sortOrder } = this.filters;

    if (sortBy === 'price') {
      return sortOrder === 'asc' ? 'price_asc' : 'price_desc';
    } else if (sortBy === 'name') {
      return sortOrder === 'asc' ? 'name' : 'name_desc';
    } else if (sortBy === 'createdAt') {
      return 'newest';
    }

    return 'relevance';
  }

  getResultsText(): string {
    if (!this.results) return '';

    const { totalCount, currentPage } = this.results;
    const startIndex = ((currentPage - 1) * this.pageSize) + 1;
    const endIndex = Math.min(currentPage * this.pageSize, totalCount);

    if (totalCount === 0) {
      return 'No results found';
    } else if (totalCount === 1) {
      return '1 result found';
    } else if (totalCount <= this.pageSize) {
      return `${totalCount} results found`;
    } else {
      return `Showing ${startIndex}-${endIndex} of ${totalCount} results`;
    }
  }

  getSearchSummary(): string {
    const appliedFilters: string[] = [];

    if (this.filters.searchTerm) {
      appliedFilters.push(`"${this.filters.searchTerm}"`);
    }

    if (this.filters.categories.length > 0) {
      appliedFilters.push(`in ${this.filters.categories.join(', ')}`);
    }

    if (this.filters.priceRange.min > 0 || this.filters.priceRange.max < 10000) {
      appliedFilters.push(`priced $${this.filters.priceRange.min}-$${this.filters.priceRange.max}`);
    }

    return appliedFilters.length > 0
      ? `Results for ${appliedFilters.join(' ')}`
      : 'All products';
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Utility methods for template
  trackByProductId(index: number, product: Product): string {
    return product._id;
  }
}