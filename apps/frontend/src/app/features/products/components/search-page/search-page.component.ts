import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { SearchResultsComponent, SearchResultsData } from '../search-results/search-results.component';
import { ProductService } from '../../services/product.service';
import { SearchFilters, Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    SearchBarComponent,
    FilterPanelComponent,
    SearchResultsComponent
  ],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {
  // UI State
  isHandset = false;
  sidenavOpened = false;

  // Search State
  searchFilters$ = new BehaviorSubject<SearchFilters>({
    searchTerm: '',
    categories: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  searchResults: SearchResultsData | null = null;
  isLoading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 20;

  private destroy$ = new Subject<void>();
  private searchTrigger$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.setupResponsiveLayout();
    this.setupSearchFromURL();
    this.setupSearchSubscription();
    this.triggerInitialSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupResponsiveLayout(): void {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isHandset = result.matches;
        this.sidenavOpened = !result.matches;
      });
  }

  private setupSearchFromURL(): void {
    // Read initial search parameters from URL
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const currentFilters = this.searchFilters$.value;
        const updatedFilters: SearchFilters = {
          searchTerm: params['q'] || currentFilters.searchTerm,
          categories: params['categories'] ? params['categories'].split(',') : currentFilters.categories,
          priceRange: {
            min: params['minPrice'] ? parseFloat(params['minPrice']) : currentFilters.priceRange.min,
            max: params['maxPrice'] ? parseFloat(params['maxPrice']) : currentFilters.priceRange.max
          },
          sortBy: params['sort'] || currentFilters.sortBy,
          sortOrder: params['order'] || currentFilters.sortOrder
        };

        this.currentPage = params['page'] ? parseInt(params['page']) : 1;
        this.searchFilters$.next(updatedFilters);
      });
  }

  private setupSearchSubscription(): void {
    // Combine filters changes with search trigger
    combineLatest([
      this.searchFilters$.pipe(distinctUntilChanged()),
      this.searchTrigger$.pipe(debounceTime(300))
    ]).pipe(
      switchMap(([filters]) => {
        this.isLoading = true;
        this.error = null;

        return this.productService.advancedSearch({
          search: filters.searchTerm,
          categories: filters.categories.length > 0 ? filters.categories : undefined,
          minPrice: filters.priceRange.min,
          maxPrice: filters.priceRange.max,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          page: this.currentPage,
          limit: this.pageSize
        }).pipe(
          catchError(error => {
            console.error('Search error:', error);
            this.error = error.message || 'Failed to search products';
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.isLoading = false;

      if (response) {
        this.searchResults = {
          products: response.products,
          totalCount: response.totalCount,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage
        };
        this.error = null;
      }
    });
  }

  private triggerInitialSearch(): void {
    // Trigger search on component initialization
    setTimeout(() => this.searchTrigger$.next(), 100);
  }

  // Event Handlers
  onSearch(searchTerm: string): void {
    const currentFilters = this.searchFilters$.value;
    const updatedFilters: SearchFilters = {
      ...currentFilters,
      searchTerm: searchTerm.trim()
    };

    this.updateFiltersAndURL(updatedFilters, 1);
  }

  onSuggestionSelected(suggestion: string): void {
    this.onSearch(suggestion);
  }

  onFiltersChange(filters: SearchFilters): void {
    this.updateFiltersAndURL(filters, 1); // Reset to page 1 when filters change
  }

  onClearFilters(): void {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      categories: [],
      priceRange: { min: 0, max: 1000 },
      sortBy: 'relevance',
      sortOrder: 'desc'
    };

    this.updateFiltersAndURL(clearedFilters, 1);
  }

  onPageChange(event: any): void {
    const newPage = event.pageIndex + 1; // Mat-paginator is 0-based
    this.pageSize = event.pageSize;
    this.currentPage = newPage;

    this.updateURLParams();
    this.searchTrigger$.next();
  }

  onSortChange(sortData: { sortBy: string; sortOrder: string }): void {
    const currentFilters = this.searchFilters$.value;
    const updatedFilters: SearchFilters = {
      ...currentFilters,
      sortBy: sortData.sortBy as any,
      sortOrder: sortData.sortOrder as any
    };

    this.updateFiltersAndURL(updatedFilters, 1);
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/products', product._id]);
  }

  onRetrySearch(): void {
    this.error = null;
    this.searchTrigger$.next();
  }

  onToggleFilters(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  // Utility Methods
  private updateFiltersAndURL(filters: SearchFilters, page: number = this.currentPage): void {
    this.currentPage = page;
    this.searchFilters$.next(filters);
    this.updateURLParams();
    this.searchTrigger$.next();
  }

  private updateURLParams(): void {
    const filters = this.searchFilters$.value;
    const queryParams: any = {};

    if (filters.searchTerm) queryParams.q = filters.searchTerm;
    if (filters.categories.length > 0) queryParams.categories = filters.categories.join(',');
    if (filters.priceRange.min > 0) queryParams.minPrice = filters.priceRange.min;
    if (filters.priceRange.max < 10000) queryParams.maxPrice = filters.priceRange.max;
    if (filters.sortBy !== 'relevance') queryParams.sort = filters.sortBy;
    if (filters.sortOrder !== 'desc') queryParams.order = filters.sortOrder;
    if (this.currentPage > 1) queryParams.page = this.currentPage;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  getCurrentFilters(): SearchFilters {
    return this.searchFilters$.value;
  }

  getSearchSummary(): string {
    const filters = this.searchFilters$.value;
    const parts: string[] = [];

    if (filters.searchTerm) {
      parts.push(`"${filters.searchTerm}"`);
    }

    if (filters.categories.length > 0) {
      parts.push(`in ${filters.categories.join(', ')}`);
    }

    return parts.length > 0 ? parts.join(' ') : 'All products';
  }
}