import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { SearchPageComponent } from './search-page.component';
import { ProductService } from '../../services/product.service';
import { SearchFilters, Product } from '../../interfaces/product.interface';

describe('SearchPageComponent', () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let queryParamsSubject: BehaviorSubject<any>;

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
    }
  ];

  const mockSearchResponse = {
    products: mockProducts,
    totalCount: 1,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject({});

    const productServiceSpyObj = jasmine.createSpyObj('ProductService', ['advancedSearch']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpyObj = {
      queryParams: queryParamsSubject.asObservable()
    };
    const breakpointObserverSpyObj = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    await TestBed.configureTestingModule({
      imports: [SearchPageComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpyObj },
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteSpyObj },
        { provide: BreakpointObserver, useValue: breakpointObserverSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    breakpointObserverSpy = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;

    // Setup default return values
    productServiceSpy.advancedSearch.and.returnValue(of(mockSearchResponse));
    breakpointObserverSpy.observe.and.returnValue(of({ matches: false, breakpoints: {} }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isHandset).toBe(false);
    expect(component.sidenavOpened).toBe(false);
    expect(component.searchResults).toBeNull();
    expect(component.isLoading).toBe(false);
    expect(component.error).toBeNull();
    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBe(20);
  });

  describe('ngOnInit', () => {
    it('should setup responsive layout for desktop', fakeAsync(() => {
      breakpointObserverSpy.observe.and.returnValue(of({ matches: false, breakpoints: {} }));

      component.ngOnInit();
      tick();

      expect(component.isHandset).toBe(false);
      expect(component.sidenavOpened).toBe(true);
    }));

    it('should setup responsive layout for mobile', fakeAsync(() => {
      breakpointObserverSpy.observe.and.returnValue(of({ matches: true, breakpoints: {} }));

      component.ngOnInit();
      tick();

      expect(component.isHandset).toBe(true);
      expect(component.sidenavOpened).toBe(false);
    }));

    it('should setup search from URL parameters', fakeAsync(() => {
      queryParamsSubject.next({
        q: 'test search',
        categories: 'electronics,books',
        minPrice: '10',
        maxPrice: '100',
        sort: 'price',
        order: 'asc',
        page: '2'
      });

      component.ngOnInit();
      tick(400); // Wait for debounce

      const filters = component.getCurrentFilters();
      expect(filters.searchTerm).toBe('test search');
      expect(filters.categories).toEqual(['electronics', 'books']);
      expect(filters.priceRange.min).toBe(10);
      expect(filters.priceRange.max).toBe(100);
      expect(filters.sortBy).toBe('price');
      expect(filters.sortOrder).toBe('asc');
      expect(component.currentPage).toBe(2);
    }));

    it('should trigger initial search', fakeAsync(() => {
      component.ngOnInit();
      tick(400); // Wait for debounce and search trigger

      expect(productServiceSpy.advancedSearch).toHaveBeenCalled();
    }));
  });

  describe('Search functionality', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(400);
      productServiceSpy.advancedSearch.calls.reset();
    }));

    it('should perform search and update results', fakeAsync(() => {
      component.onSearch('laptop');
      tick(400);

      expect(productServiceSpy.advancedSearch).toHaveBeenCalledWith({
        search: 'laptop',
        categories: undefined,
        minPrice: 0,
        maxPrice: 1000,
        sortBy: 'relevance',
        sortOrder: 'desc',
        page: 1,
        limit: 20
      });
      expect(component.searchResults).toEqual({
        products: mockProducts,
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });
    }));

    it('should handle search error gracefully', fakeAsync(() => {
      const error = new Error('Search failed');
      productServiceSpy.advancedSearch.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.onSearch('error');
      tick(400);

      expect(component.error).toBe('Search failed');
      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Search error:', error);
    }));

    it('should update URL parameters after search', fakeAsync(() => {
      component.onSearch('test');
      tick(400);

      expect(routerSpy.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRouteSpy,
        queryParams: { q: 'test' },
        replaceUrl: true
      });
    }));

    it('should trim search term', fakeAsync(() => {
      component.onSearch('  test  ');
      tick(400);

      const filters = component.getCurrentFilters();
      expect(filters.searchTerm).toBe('test');
    }));
  });

  describe('Filter functionality', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(400);
      productServiceSpy.advancedSearch.calls.reset();
    }));

    it('should update filters and perform search', fakeAsync(() => {
      const newFilters: SearchFilters = {
        searchTerm: 'laptop',
        categories: ['electronics'],
        priceRange: { min: 100, max: 500 },
        sortBy: 'price',
        sortOrder: 'asc'
      };

      component.onFiltersChange(newFilters);
      tick(400);

      expect(productServiceSpy.advancedSearch).toHaveBeenCalledWith({
        search: 'laptop',
        categories: ['electronics'],
        minPrice: 100,
        maxPrice: 500,
        sortBy: 'price',
        sortOrder: 'asc',
        page: 1,
        limit: 20
      });
    }));

    it('should clear all filters', fakeAsync(() => {
      // Set some filters first
      component.onSearch('test');
      tick(400);
      productServiceSpy.advancedSearch.calls.reset();

      component.onClearFilters();
      tick(400);

      const filters = component.getCurrentFilters();
      expect(filters.searchTerm).toBe('');
      expect(filters.categories).toEqual([]);
      expect(filters.priceRange).toEqual({ min: 0, max: 1000 });
      expect(filters.sortBy).toBe('relevance');
      expect(filters.sortOrder).toBe('desc');
      expect(component.currentPage).toBe(1);
    }));
  });

  describe('Pagination functionality', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(400);
      productServiceSpy.advancedSearch.calls.reset();
    }));

    it('should handle page change', fakeAsync(() => {
      const pageEvent = { pageIndex: 1, pageSize: 20, length: 100 };

      component.onPageChange(pageEvent);
      tick(400);

      expect(component.currentPage).toBe(2); // pageIndex + 1
      expect(component.pageSize).toBe(20);
      expect(productServiceSpy.advancedSearch).toHaveBeenCalled();
    }));
  });

  describe('Sorting functionality', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(400);
      productServiceSpy.advancedSearch.calls.reset();
    }));

    it('should handle sort change', fakeAsync(() => {
      component.onSortChange({ sortBy: 'price', sortOrder: 'desc' });
      tick(400);

      const filters = component.getCurrentFilters();
      expect(filters.sortBy).toBe('price');
      expect(filters.sortOrder).toBe('desc');
      expect(component.currentPage).toBe(1); // Reset to page 1
      expect(productServiceSpy.advancedSearch).toHaveBeenCalled();
    }));
  });

  describe('Navigation functionality', () => {
    it('should navigate to product detail on product click', () => {
      const product = mockProducts[0];

      component.onProductClick(product);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/products', '1']);
    });

    it('should toggle filters sidebar', () => {
      component.sidenavOpened = false;

      component.onToggleFilters();

      expect(component.sidenavOpened).toBe(true);

      component.onToggleFilters();

      expect(component.sidenavOpened).toBe(false);
    });
  });

  describe('Suggestion functionality', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(400);
      productServiceSpy.advancedSearch.calls.reset();
    }));

    it('should handle suggestion selection', fakeAsync(() => {
      component.onSuggestionSelected('laptop computers');
      tick(400);

      const filters = component.getCurrentFilters();
      expect(filters.searchTerm).toBe('laptop computers');
      expect(productServiceSpy.advancedSearch).toHaveBeenCalled();
    }));
  });

  describe('Error handling', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      tick(400);
    }));

    it('should retry search on error', fakeAsync(() => {
      component.error = 'Some error';
      productServiceSpy.advancedSearch.calls.reset();

      component.onRetrySearch();
      tick(400);

      expect(component.error).toBeNull();
      expect(productServiceSpy.advancedSearch).toHaveBeenCalled();
    }));
  });

  describe('URL parameter handling', () => {
    it('should create correct query parameters', () => {
      const filters: SearchFilters = {
        searchTerm: 'test',
        categories: ['electronics', 'books'],
        priceRange: { min: 10, max: 100 },
        sortBy: 'price',
        sortOrder: 'asc'
      };

      component.searchFilters$.next(filters);
      component.currentPage = 2;
      component['updateURLParams']();

      expect(routerSpy.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRouteSpy,
        queryParams: {
          q: 'test',
          categories: 'electronics,books',
          minPrice: 10,
          maxPrice: 100,
          sort: 'price',
          order: 'asc',
          page: 2
        },
        replaceUrl: true
      });
    });

    it('should omit default values from query parameters', () => {
      const defaultFilters: SearchFilters = {
        searchTerm: '',
        categories: [],
        priceRange: { min: 0, max: 10000 },
        sortBy: 'relevance',
        sortOrder: 'desc'
      };

      component.searchFilters$.next(defaultFilters);
      component.currentPage = 1;
      component['updateURLParams']();

      expect(routerSpy.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRouteSpy,
        queryParams: {},
        replaceUrl: true
      });
    });
  });

  describe('Search summary', () => {
    it('should generate search summary with term and categories', () => {
      const filters: SearchFilters = {
        searchTerm: 'laptop',
        categories: ['electronics'],
        priceRange: { min: 0, max: 1000 },
        sortBy: 'relevance',
        sortOrder: 'desc'
      };

      component.searchFilters$.next(filters);

      expect(component.getSearchSummary()).toBe('"laptop" in electronics');
    });

    it('should return "All products" for no filters', () => {
      const filters: SearchFilters = {
        searchTerm: '',
        categories: [],
        priceRange: { min: 0, max: 1000 },
        sortBy: 'relevance',
        sortOrder: 'desc'
      };

      component.searchFilters$.next(filters);

      expect(component.getSearchSummary()).toBe('All products');
    });
  });

  describe('Component lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      component.ngOnInit();
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});