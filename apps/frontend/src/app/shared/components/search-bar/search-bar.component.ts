import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { ProductService } from '../../../features/products/services/product.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search products...';
  @Input() initialValue = '';
  @Input() showSearchButton = true;
  @Input() debounceTime = 300;
  @Output() search = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<string>();

  searchTerm = '';
  suggestions: string[] = [];
  isLoading = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.searchTerm = this.initialValue;

    // Set up search suggestions with debouncing
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        switchMap(query => {
          if (!query || query.length < 2) {
            return of({ suggestions: [], query: '' });
          }

          this.isLoading = true;
          return this.productService.getSearchSuggestions(query, 10)
            .pipe(
              catchError(error => {
                console.warn('Search suggestions failed:', error);
                return of({ suggestions: [], query });
              })
            );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(response => {
        this.suggestions = response.suggestions;
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm.trim());
      this.clearSuggestions();
    }
  }

  onSuggestionSelect(suggestion: string): void {
    this.searchTerm = suggestion;
    this.suggestionSelected.emit(suggestion);
    this.clearSuggestions();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearch();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.clearSuggestions();
    this.search.emit('');
  }

  private clearSuggestions(): void {
    this.suggestions = [];
    this.isLoading = false;
  }
}