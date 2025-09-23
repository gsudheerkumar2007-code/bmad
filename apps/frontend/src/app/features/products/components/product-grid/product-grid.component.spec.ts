import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import { PageEvent } from '@angular/material/paginator';
import { of } from 'rxjs';
import { ProductGridComponent } from './product-grid.component';
import { Product, ProductListResponse } from '../../interfaces/product.interface';

describe('ProductGridComponent', () => {
  let component: ProductGridComponent;
  let fixture: ComponentFixture<ProductGridComponent>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

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
    },
    {
      _id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 149.99,
      category: 'Clothing',
      images: ['image2.jpg'],
      inventory: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockProductResponse: ProductListResponse = {
    products: mockProducts,
    totalCount: 2,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  beforeEach(async () => {
    const breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    await TestBed.configureTestingModule({
      imports: [ProductGridComponent, NoopAnimationsModule],
      providers: [
        { provide: BreakpointObserver, useValue: breakpointObserverSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductGridComponent);
    component = fixture.componentInstance;
    mockBreakpointObserver = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;

    // Setup default breakpoint observer mock
    mockBreakpointObserver.observe.and.returnValue(of({
      matches: true,
      breakpoints: {
        '(max-width: 599.98px)': false,
        '(min-width: 600px) and (max-width: 959.98px)': false,
        '(min-width: 960px) and (max-width: 1279.98px)': false,
        '(min-width: 1280px) and (max-width: 1919.98px)': true,
        '(min-width: 1920px)': false
      }
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display products when available', () => {
    component.products = mockProducts;
    component.productResponse = mockProductResponse;
    fixture.detectChanges();

    const productCards = fixture.nativeElement.querySelectorAll('app-product-card');
    expect(productCards.length).toBe(2);
  });

  it('should show loading skeletons when loading', () => {
    component.loading = true;
    component.products = [];
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-product-card-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show error state when error occurs', () => {
    component.error = 'Failed to load products';
    component.loading = false;
    component.products = [];
    fixture.detectChanges();

    const errorContainer = fixture.nativeElement.querySelector('.error-container');
    expect(errorContainer).toBeTruthy();
    expect(errorContainer.textContent).toContain('Failed to load products');
  });

  it('should show empty state when no products found', () => {
    component.products = [];
    component.loading = false;
    component.error = null;
    fixture.detectChanges();

    const emptyContainer = fixture.nativeElement.querySelector('.empty-container');
    expect(emptyContainer).toBeTruthy();
    expect(emptyContainer.textContent).toContain('No products found');
  });

  it('should emit retry event when retry button is clicked', () => {
    spyOn(component.retry, 'emit');
    component.error = 'Network error';
    component.loading = false;
    fixture.detectChanges();

    const retryButton = fixture.nativeElement.querySelector('.error-container button');
    retryButton.click();

    expect(component.retry.emit).toHaveBeenCalled();
  });

  it('should display pagination when product response is available', () => {
    component.products = mockProducts;
    component.productResponse = mockProductResponse;
    fixture.detectChanges();

    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeTruthy();
  });

  it('should emit pageChange event when page is changed', () => {
    spyOn(component.pageChange, 'emit');
    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 12,
      length: 24
    };

    component.onPageChange(pageEvent);

    expect(component.pageChange.emit).toHaveBeenCalledWith(pageEvent);
  });

  it('should emit addToCart event when product card emits it', () => {
    spyOn(component.addToCart, 'emit');
    const product = mockProducts[0];

    component.onAddToCart(product);

    expect(component.addToCart.emit).toHaveBeenCalledWith(product);
  });

  it('should emit quickView event when product card emits it', () => {
    spyOn(component.quickView, 'emit');
    const product = mockProducts[0];

    component.onQuickView(product);

    expect(component.quickView.emit).toHaveBeenCalledWith(product);
  });

  it('should track products by ID', () => {
    const product = mockProducts[0];
    const trackingId = component.trackByProduct(0, product);

    expect(trackingId).toBe('1');
  });

  it('should show loading indicator when loading more products', () => {
    component.products = mockProducts;
    component.loading = true;
    fixture.detectChanges();

    const loadingMore = fixture.nativeElement.querySelector('.loading-more');
    expect(loadingMore).toBeTruthy();
    expect(loadingMore.textContent).toContain('Loading more products...');
  });

  describe('responsive grid', () => {
    it('should set 4 columns for large screens', () => {
      component.ngOnInit();
      expect(component.columns).toBe(4);
      expect(component.rowHeight).toBe('420px');
    });

    it('should update grid layout based on breakpoints', () => {
      // Mock XSmall breakpoint
      mockBreakpointObserver.observe.and.returnValue(of({
        matches: true,
        breakpoints: {
          '(max-width: 599.98px)': true,
          '(min-width: 600px) and (max-width: 959.98px)': false,
          '(min-width: 960px) and (max-width: 1279.98px)': false,
          '(min-width: 1280px) and (max-width: 1919.98px)': false,
          '(min-width: 1920px)': false
        }
      }));

      component.ngOnInit();

      expect(component.columns).toBe(1);
      expect(component.rowHeight).toBe('380px');
    });

    it('should update skeleton array based on columns', () => {
      component.columns = 2;
      component.ngOnInit();

      expect(component.skeletonArray.length).toBe(6); // 2 columns * 3 rows
    });
  });

  it('should handle undefined product response', () => {
    component.products = mockProducts;
    component.productResponse = null;
    fixture.detectChanges();

    // Should not show pagination
    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeFalsy();
  });

  it('should apply correct CSS classes to grid container', () => {
    const gridContainer = fixture.nativeElement.querySelector('.product-grid-container');
    expect(gridContainer).toBeTruthy();
  });

  it('should handle empty products array gracefully', () => {
    component.products = [];
    component.productResponse = {
      ...mockProductResponse,
      products: [],
      totalCount: 0
    };
    fixture.detectChanges();

    const emptyContainer = fixture.nativeElement.querySelector('.empty-container');
    expect(emptyContainer).toBeTruthy();
  });
});