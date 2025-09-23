import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PageEvent } from '@angular/material/paginator';
import { of, throwError } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { Product, ProductListResponse } from '../../interfaces/product.interface';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 99.99,
      category: 'Electronics',
      images: ['image1.jpg'],
      inventory: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockProductResponse: ProductListResponse = {
    products: mockProducts,
    totalCount: 1,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      queryParams: of({}),
      params: of({})
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    mockProductService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockProductService.getProducts.and.returnValue(of(mockProductResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    fixture.detectChanges();

    expect(mockProductService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
    expect(component.productResponse).toEqual(mockProductResponse);
  });

  it('should handle search input with debounce', fakeAsync(() => {
    fixture.detectChanges();

    component.searchControl.setValue('test search');
    tick(300); // Wait for debounce

    expect(mockProductService.getProducts).toHaveBeenCalledWith(
      jasmine.objectContaining({
        filters: jasmine.objectContaining({
          search: 'test search'
        })
      })
    );
  }));

  it('should handle sort selection', () => {
    fixture.detectChanges();

    component.sortControl.setValue('price');

    expect(mockProductService.getProducts).toHaveBeenCalledWith(
      jasmine.objectContaining({
        sort: 'price'
      })
    );
  });

  it('should handle page changes', () => {
    fixture.detectChanges();

    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 24,
      length: 100
    };

    component.onPageChange(pageEvent);

    expect(mockProductService.getProducts).toHaveBeenCalledWith(
      jasmine.objectContaining({
        page: 2,
        limit: 24
      })
    );
  });

  it('should update URL with query parameters', () => {
    fixture.detectChanges();

    component.searchControl.setValue('test');

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({
          search: 'test'
        })
      })
    );
  });

  it('should handle query parameters from URL', () => {
    mockActivatedRoute.queryParams = of({
      page: '2',
      search: 'test',
      category: 'Electronics',
      sort: 'price'
    });

    fixture.detectChanges();

    expect(component.currentQuery).toEqual(jasmine.objectContaining({
      page: 2,
      sort: 'price',
      filters: jasmine.objectContaining({
        search: 'test',
        category: 'Electronics'
      })
    }));
  });

  it('should toggle view mode', () => {
    expect(component.isGridView).toBe(true);

    component.toggleView();

    expect(component.isGridView).toBe(false);
  });

  it('should detect active filters', () => {
    component.currentQuery.filters = {
      search: 'test',
      category: 'Electronics'
    };

    expect(component.hasActiveFilters()).toBe(true);

    component.currentQuery.filters = {};

    expect(component.hasActiveFilters()).toBe(false);
  });

  it('should remove individual filters', () => {
    component.currentQuery.filters = {
      search: 'test',
      category: 'Electronics'
    };

    component.removeFilter('search');

    expect(component.currentQuery.filters?.search).toBeUndefined();
    expect(component.currentQuery.filters?.category).toBe('Electronics');
  });

  it('should clear all filters', () => {
    component.currentQuery.filters = {
      search: 'test',
      category: 'Electronics',
      minPrice: 50,
      maxPrice: 200
    };

    component.clearAllFilters();

    expect(component.currentQuery.filters).toEqual({});
    expect(component.searchControl.value).toBe('');
  });

  it('should handle add to cart', () => {
    spyOn(console, 'log');
    const product = mockProducts[0];

    component.onAddToCart(product);

    expect(console.log).toHaveBeenCalledWith('Add to cart:', product);
  });

  it('should handle quick view navigation', () => {
    const product = mockProducts[0];

    component.onQuickView(product);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', '1']);
  });

  it('should calculate results range correctly', () => {
    component.productResponse = {
      ...mockProductResponse,
      totalCount: 25,
      currentPage: 2
    };
    component.pageSize = 12;
    component.products = new Array(12).fill(mockProducts[0]);

    const range = component.getResultsRange();

    expect(range).toBe('13-24');
  });

  it('should handle empty results range', () => {
    component.productResponse = null;

    const range = component.getResultsRange();

    expect(range).toBe('');
  });

  it('should handle loading state', () => {
    component.loading = true;
    fixture.detectChanges();

    const productGrid = fixture.nativeElement.querySelector('app-product-grid');
    expect(productGrid.getAttribute('ng-reflect-loading')).toBe('true');
  });

  it('should handle error state', () => {
    mockProductService.getProducts.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    fixture.detectChanges();

    expect(component.error).toBe('Network error');
    expect(component.loading).toBe(false);
  });

  it('should display search input', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('input[placeholder*="Search"]');
    expect(searchInput).toBeTruthy();
  });

  it('should display sort selector', () => {
    fixture.detectChanges();

    const sortSelect = fixture.nativeElement.querySelector('mat-select');
    expect(sortSelect).toBeTruthy();
  });

  it('should display results info when products are loaded', () => {
    component.productResponse = mockProductResponse;
    component.products = mockProducts;
    fixture.detectChanges();

    const resultsInfo = fixture.nativeElement.querySelector('.results-info');
    expect(resultsInfo).toBeTruthy();
    expect(resultsInfo.textContent).toContain('Showing');
  });

  it('should show active filters chips', () => {
    component.currentQuery.filters = {
      search: 'test',
      category: 'Electronics'
    };
    fixture.detectChanges();

    const filterChips = fixture.nativeElement.querySelectorAll('mat-chip');
    expect(filterChips.length).toBeGreaterThan(0);
  });

  it('should handle price filter removal', () => {
    component.currentQuery.filters = {
      minPrice: 50,
      maxPrice: 200
    };

    component.removeFilter('price');

    expect(component.currentQuery.filters?.minPrice).toBeUndefined();
    expect(component.currentQuery.filters?.maxPrice).toBeUndefined();
  });

  it('should not show page info for single page results', () => {
    component.productResponse = {
      ...mockProductResponse,
      totalPages: 1
    };
    fixture.detectChanges();

    const pageInfo = fixture.nativeElement.querySelector('.page-info');
    expect(pageInfo).toBeFalsy();
  });

  it('should show page info for multi-page results', () => {
    component.productResponse = {
      ...mockProductResponse,
      totalPages: 5,
      currentPage: 2
    };
    fixture.detectChanges();

    const pageInfo = fixture.nativeElement.querySelector('.page-info');
    expect(pageInfo).toBeTruthy();
    expect(pageInfo.textContent).toContain('Page 2 of 5');
  });

  it('should handle component destruction', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    fixture.destroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});