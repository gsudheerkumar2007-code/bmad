import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PageEvent } from '@angular/material/paginator';
import { SearchResultsComponent, SearchResultsData } from './search-results.component';
import { Product, SearchFilters } from '../../interfaces/product.interface';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Test Product 1',
      description: 'Test description 1',
      price: 99.99,
      category: 'electronics',
      images: [],
      inventory: 10,
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      _id: '2',
      name: 'Test Product 2',
      description: 'Test description 2',
      price: 149.99,
      category: 'books',
      images: [],
      inventory: 5,
      isActive: true,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02')
    }
  ];

  const mockSearchResults: SearchResultsData = {
    products: mockProducts,
    totalCount: 25,
    currentPage: 1,
    totalPages: 3,
    hasNextPage: true,
    hasPrevPage: false
  };

  const mockFilters: SearchFilters = {
    searchTerm: 'test',
    categories: ['electronics'],
    priceRange: { min: 0, max: 200 },
    sortBy: 'price',
    sortOrder: 'asc'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultsComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.results).toBeNull();
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
    expect(component.showPagination).toBe(true);
    expect(component.pageSize).toBe(20);
    expect(component.filters.searchTerm).toBe('');
    expect(component.filters.sortBy).toBe('relevance');
  });

  describe('ngOnChanges', () => {
    it('should scroll to top when results change', () => {
      spyOn(window, 'scrollTo');
      component.results = mockSearchResults;

      component.ngOnChanges({
        results: {
          currentValue: mockSearchResults,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true
        }
      } as any);

      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('Event Handlers', () => {
    it('should emit pageChange event and scroll to top', () => {
      spyOn(component.pageChange, 'emit');
      spyOn(window, 'scrollTo');
      const pageEvent: PageEvent = { pageIndex: 1, pageSize: 20, length: 100 };

      component.onPageChange(pageEvent);

      expect(component.pageChange.emit).toHaveBeenCalledWith(pageEvent);
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('should emit sortChange event for price ascending', () => {
      spyOn(component.sortChange, 'emit');

      component.onSortChange('price_asc');

      expect(component.sortChange.emit).toHaveBeenCalledWith({
        sortBy: 'price',
        sortOrder: 'asc'
      });
    });

    it('should emit sortChange event for price descending', () => {
      spyOn(component.sortChange, 'emit');

      component.onSortChange('price_desc');

      expect(component.sortChange.emit).toHaveBeenCalledWith({
        sortBy: 'price',
        sortOrder: 'desc'
      });
    });

    it('should emit sortChange event for name ascending', () => {
      spyOn(component.sortChange, 'emit');

      component.onSortChange('name');

      expect(component.sortChange.emit).toHaveBeenCalledWith({
        sortBy: 'name',
        sortOrder: 'asc'
      });
    });

    it('should emit sortChange event for name descending', () => {
      spyOn(component.sortChange, 'emit');

      component.onSortChange('name_desc');

      expect(component.sortChange.emit).toHaveBeenCalledWith({
        sortBy: 'name',
        sortOrder: 'desc'
      });
    });

    it('should emit sortChange event for newest first', () => {
      spyOn(component.sortChange, 'emit');

      component.onSortChange('newest');

      expect(component.sortChange.emit).toHaveBeenCalledWith({
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    });

    it('should emit productClick event', () => {
      spyOn(component.productClick, 'emit');
      const product = mockProducts[0];

      component.onProductClick(product);

      expect(component.productClick.emit).toHaveBeenCalledWith(product);
    });

    it('should emit retrySearch event', () => {
      spyOn(component.retrySearch, 'emit');

      component.onRetry();

      expect(component.retrySearch.emit).toHaveBeenCalled();
    });
  });

  describe('getCurrentSortValue', () => {
    it('should return price_asc for ascending price sort', () => {
      component.filters = { ...mockFilters, sortBy: 'price', sortOrder: 'asc' };
      expect(component.getCurrentSortValue()).toBe('price_asc');
    });

    it('should return price_desc for descending price sort', () => {
      component.filters = { ...mockFilters, sortBy: 'price', sortOrder: 'desc' };
      expect(component.getCurrentSortValue()).toBe('price_desc');
    });

    it('should return name for ascending name sort', () => {
      component.filters = { ...mockFilters, sortBy: 'name', sortOrder: 'asc' };
      expect(component.getCurrentSortValue()).toBe('name');
    });

    it('should return name_desc for descending name sort', () => {
      component.filters = { ...mockFilters, sortBy: 'name', sortOrder: 'desc' };
      expect(component.getCurrentSortValue()).toBe('name_desc');
    });

    it('should return newest for createdAt sort', () => {
      component.filters = { ...mockFilters, sortBy: 'createdAt', sortOrder: 'desc' };
      expect(component.getCurrentSortValue()).toBe('newest');
    });

    it('should return relevance as default', () => {
      component.filters = { ...mockFilters, sortBy: 'relevance', sortOrder: 'desc' };
      expect(component.getCurrentSortValue()).toBe('relevance');
    });
  });

  describe('getResultsText', () => {
    it('should return empty string when no results', () => {
      component.results = null;
      expect(component.getResultsText()).toBe('');
    });

    it('should return "No results found" for zero results', () => {
      component.results = { ...mockSearchResults, totalCount: 0 };
      expect(component.getResultsText()).toBe('No results found');
    });

    it('should return "1 result found" for single result', () => {
      component.results = { ...mockSearchResults, totalCount: 1 };
      expect(component.getResultsText()).toBe('1 result found');
    });

    it('should return total count for results within page size', () => {
      component.results = { ...mockSearchResults, totalCount: 15 };
      expect(component.getResultsText()).toBe('15 results found');
    });

    it('should return range for paginated results', () => {
      component.results = { ...mockSearchResults, totalCount: 25, currentPage: 2 };
      component.pageSize = 10;
      expect(component.getResultsText()).toBe('Showing 11-20 of 25 results');
    });

    it('should handle last page correctly', () => {
      component.results = { ...mockSearchResults, totalCount: 25, currentPage: 3 };
      component.pageSize = 10;
      expect(component.getResultsText()).toBe('Showing 21-25 of 25 results');
    });
  });

  describe('getSearchSummary', () => {
    it('should return search term only', () => {
      component.filters = { ...mockFilters, categories: [], priceRange: { min: 0, max: 10000 } };
      expect(component.getSearchSummary()).toBe('Results for "test"');
    });

    it('should return categories only', () => {
      component.filters = { ...mockFilters, searchTerm: '', priceRange: { min: 0, max: 10000 } };
      expect(component.getSearchSummary()).toBe('Results for in electronics');
    });

    it('should return price range only', () => {
      component.filters = { ...mockFilters, searchTerm: '', categories: [] };
      expect(component.getSearchSummary()).toBe('Results for priced $0-$200');
    });

    it('should combine search term, categories, and price range', () => {
      component.filters = mockFilters;
      expect(component.getSearchSummary()).toBe('Results for "test" in electronics priced $0-$200');
    });

    it('should return "All products" when no filters applied', () => {
      component.filters = {
        searchTerm: '',
        categories: [],
        priceRange: { min: 0, max: 10000 },
        sortBy: 'relevance',
        sortOrder: 'desc'
      };
      expect(component.getSearchSummary()).toBe('All products');
    });

    it('should handle multiple categories', () => {
      component.filters = {
        ...mockFilters,
        searchTerm: '',
        categories: ['electronics', 'books'],
        priceRange: { min: 0, max: 10000 }
      };
      expect(component.getSearchSummary()).toBe('Results for in electronics, books');
    });
  });

  describe('trackByProductId', () => {
    it('should return product id for tracking', () => {
      const product = mockProducts[0];
      expect(component.trackByProductId(0, product)).toBe('1');
    });
  });
});