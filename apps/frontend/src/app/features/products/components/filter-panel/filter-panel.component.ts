import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { CategoryInfo, PriceRange, SearchFilters } from '../../interfaces/product.interface';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent implements OnInit, OnDestroy {
  @Input() filters: SearchFilters = {
    searchTerm: '',
    categories: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: 'relevance',
    sortOrder: 'desc'
  };
  @Output() filtersChange = new EventEmitter<SearchFilters>();
  @Output() clearFilters = new EventEmitter<void>();

  availableCategories: CategoryInfo[] = [];
  globalPriceRange: PriceRange = { min: 0, max: 1000 };
  localPriceRange: { min: number; max: number } = { min: 0, max: 1000 };

  isLoadingCategories = false;
  isLoadingPriceRange = false;

  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Newest' }
  ];

  sortOrderOptions = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadPriceRange();
    this.localPriceRange = { ...this.filters.priceRange };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.isLoadingCategories = true;
    this.productService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.availableCategories = response.categories;
          this.isLoadingCategories = false;
        },
        error: (error) => {
          console.error('Failed to load categories:', error);
          this.isLoadingCategories = false;
        }
      });
  }

  private loadPriceRange(): void {
    this.isLoadingPriceRange = true;
    this.productService.getPriceRange()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.globalPriceRange = response.priceRange;
          if (this.filters.priceRange.min === 0 && this.filters.priceRange.max === 1000) {
            this.localPriceRange = { ...this.globalPriceRange };
            this.filters.priceRange = { ...this.globalPriceRange };
          }
          this.isLoadingPriceRange = false;
        },
        error: (error) => {
          console.error('Failed to load price range:', error);
          this.isLoadingPriceRange = false;
        }
      });
  }

  onCategoryChange(category: string, checked: boolean): void {
    const updatedCategories = checked
      ? [...this.filters.categories, category]
      : this.filters.categories.filter(cat => cat !== category);

    const updatedFilters: SearchFilters = {
      ...this.filters,
      categories: updatedCategories
    };

    this.filters = updatedFilters;
    this.filtersChange.emit(updatedFilters);
  }

  onPriceRangeChange(): void {
    const updatedFilters: SearchFilters = {
      ...this.filters,
      priceRange: { ...this.localPriceRange }
    };

    this.filters = updatedFilters;
    this.filtersChange.emit(updatedFilters);
  }

  onMinPriceInput(value: string): void {
    const minPrice = parseFloat(value) || 0;
    this.localPriceRange.min = Math.max(minPrice, this.globalPriceRange.min);
    this.onPriceRangeChange();
  }

  onMaxPriceInput(value: string): void {
    const maxPrice = parseFloat(value) || this.globalPriceRange.max;
    this.localPriceRange.max = Math.min(maxPrice, this.globalPriceRange.max);
    this.onPriceRangeChange();
  }

  onSortChange(): void {
    const updatedFilters: SearchFilters = {
      ...this.filters
    };

    this.filtersChange.emit(updatedFilters);
  }

  removeCategory(category: string): void {
    this.onCategoryChange(category, false);
  }

  onClearAllFilters(): void {
    this.filters = {
      searchTerm: '',
      categories: [],
      priceRange: { ...this.globalPriceRange },
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
    this.localPriceRange = { ...this.globalPriceRange };
    this.clearFilters.emit();
  }

  isCategorySelected(category: string): boolean {
    return this.filters.categories.includes(category);
  }

  getAppliedFiltersCount(): number {
    let count = 0;

    if (this.filters.categories.length > 0) count++;

    if (this.filters.priceRange.min !== this.globalPriceRange.min ||
        this.filters.priceRange.max !== this.globalPriceRange.max) count++;

    if (this.filters.sortBy !== 'relevance') count++;

    return count;
  }

  getSortLabel(sortBy: string): string {
    const option = this.sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : sortBy;
  }
}