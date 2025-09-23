import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product.interface';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockProduct: Product = {
    _id: '1',
    name: 'Test Product',
    description: 'This is a detailed description of the test product',
    price: 99.99,
    category: 'Electronics',
    images: ['image1.jpg', 'image2.jpg'],
    inventory: 10,
    isActive: true,
    weight: 2.5,
    dimensions: { length: 10, width: 8, height: 3 },
    tags: ['test', 'electronics', 'gadget'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getProduct',
      'isInStock',
      'getStockStatus',
      'getStockStatusColor'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      params: of({ productId: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    mockProductService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mock returns
    mockProductService.getProduct.and.returnValue(of(mockProduct));
    mockProductService.isInStock.and.returnValue(true);
    mockProductService.getStockStatus.and.returnValue('In Stock');
    mockProductService.getStockStatusColor.and.returnValue('primary');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product on init', () => {
    fixture.detectChanges();

    expect(mockProductService.getProduct).toHaveBeenCalledWith('1');
    expect(component.product).toEqual(mockProduct);
    expect(component.loading).toBe(false);
  });

  it('should display product information', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.product-title').textContent).toContain('Test Product');
    expect(compiled.querySelector('.price').textContent).toContain('$99.99');
    expect(compiled.querySelector('.product-description p').textContent).toContain('This is a detailed description');
  });

  it('should show breadcrumb navigation', () => {
    fixture.detectChanges();

    const breadcrumbs = fixture.nativeElement.querySelectorAll('.breadcrumb-link, .breadcrumb-current');
    expect(breadcrumbs.length).toBeGreaterThan(0);
    expect(breadcrumbs[breadcrumbs.length - 1].textContent).toContain('Test Product');
  });

  it('should display product specifications', () => {
    fixture.detectChanges();

    const specItems = fixture.nativeElement.querySelectorAll('.spec-item');
    expect(specItems.length).toBeGreaterThan(0);

    // Check for category specification
    const categorySpec = Array.from(specItems).find(item =>
      item.textContent.includes('Category:')
    );
    expect(categorySpec).toBeTruthy();
    expect(categorySpec.textContent).toContain('Electronics');
  });

  it('should display product tags', () => {
    fixture.detectChanges();

    const tagsTab = fixture.nativeElement.querySelector('mat-tab[label="Tags"]');
    expect(tagsTab).toBeTruthy();
  });

  it('should setup quantity control based on inventory', () => {
    fixture.detectChanges();

    const availableQuantities = component.getAvailableQuantities();
    expect(availableQuantities).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should limit quantity to inventory when inventory is low', () => {
    const lowInventoryProduct = { ...mockProduct, inventory: 3 };
    mockProductService.getProduct.and.returnValue(of(lowInventoryProduct));

    fixture.detectChanges();

    const availableQuantities = component.getAvailableQuantities();
    expect(availableQuantities).toEqual([1, 2, 3]);
  });

  it('should handle add to cart action', () => {
    spyOn(console, 'log');
    fixture.detectChanges();

    component.quantityControl.setValue(2);
    component.addToCart();

    expect(console.log).toHaveBeenCalledWith('Add to cart:', mockProduct, 'Quantity:', 2);
  });

  it('should handle buy now action', () => {
    spyOn(console, 'log');
    fixture.detectChanges();

    component.quantityControl.setValue(1);
    component.buyNow();

    expect(console.log).toHaveBeenCalledWith('Buy now:', mockProduct, 'Quantity:', 1);
  });

  it('should toggle favorite status', () => {
    spyOn(console, 'log');
    fixture.detectChanges();

    expect(component.isFavorite).toBe(false);

    component.toggleFavorite();

    expect(component.isFavorite).toBe(true);
    expect(console.log).toHaveBeenCalledWith('Toggle favorite:', mockProduct, 'Is favorite:', true);
  });

  it('should disable actions for out of stock products', () => {
    mockProductService.isInStock.and.returnValue(false);
    fixture.detectChanges();

    const addToCartButton = fixture.nativeElement.querySelector('.add-to-cart-btn');
    const buyNowButton = fixture.nativeElement.querySelector('.buy-now-btn');

    expect(addToCartButton.disabled).toBe(true);
    expect(buyNowButton.disabled).toBe(true);
  });

  it('should show inventory warning for low stock', () => {
    const lowStockProduct = { ...mockProduct, inventory: 3 };
    mockProductService.getProduct.and.returnValue(of(lowStockProduct));
    fixture.detectChanges();

    const inventoryWarning = fixture.nativeElement.querySelector('.inventory-warning');
    expect(inventoryWarning).toBeTruthy();
    expect(inventoryWarning.textContent).toContain('Only 3 left in stock');
  });

  it('should get correct stock icon', () => {
    component.product = mockProduct;

    expect(component.getStockIcon()).toBe('check_circle');

    const outOfStockProduct = { ...mockProduct, inventory: 0 };
    component.product = outOfStockProduct;
    expect(component.getStockIcon()).toBe('remove_circle_outline');

    const lowStockProduct = { ...mockProduct, inventory: 3 };
    component.product = lowStockProduct;
    expect(component.getStockIcon()).toBe('warning');

    const inactiveProduct = { ...mockProduct, isActive: false };
    component.product = inactiveProduct;
    expect(component.getStockIcon()).toBe('cancel');
  });

  it('should handle image change events', () => {
    spyOn(console, 'log');
    const imageEvent = { index: 1, image: 'image2.jpg' };

    component.onImageChange(imageEvent);

    expect(console.log).toHaveBeenCalledWith('Image changed:', imageEvent);
  });

  it('should handle loading state', () => {
    component.loading = true;
    fixture.detectChanges();

    const loadingContainer = fixture.nativeElement.querySelector('.loading-container');
    expect(loadingContainer).toBeTruthy();
    expect(loadingContainer.textContent).toContain('Loading product details...');
  });

  it('should handle error state', () => {
    mockProductService.getProduct.and.returnValue(
      throwError(() => new Error('Product not found'))
    );

    fixture.detectChanges();

    expect(component.error).toBe('Product not found');
    expect(component.loading).toBe(false);

    const errorContainer = fixture.nativeElement.querySelector('.error-container');
    expect(errorContainer).toBeTruthy();
    expect(errorContainer.textContent).toContain('Product not found');
  });

  it('should show back to products link in error state', () => {
    component.error = 'Product not found';
    component.loading = false;
    fixture.detectChanges();

    const backLink = fixture.nativeElement.querySelector('.error-container button[routerLink="/products"]');
    expect(backLink).toBeTruthy();
  });

  it('should display dimensions when available', () => {
    fixture.detectChanges();

    const dimensionsSpec = Array.from(fixture.nativeElement.querySelectorAll('.spec-item')).find(item =>
      item.textContent.includes('Dimensions:')
    );

    expect(dimensionsSpec).toBeTruthy();
    expect(dimensionsSpec.textContent).toContain('10" × 8" × 3"');
  });

  it('should display weight when available', () => {
    fixture.detectChanges();

    const weightSpec = Array.from(fixture.nativeElement.querySelectorAll('.spec-item')).find(item =>
      item.textContent.includes('Weight:')
    );

    expect(weightSpec).toBeTruthy();
    expect(weightSpec.textContent).toContain('2.5 lbs');
  });

  it('should show quantity selector only for in-stock products', () => {
    mockProductService.isInStock.and.returnValue(true);
    fixture.detectChanges();

    let quantitySelector = fixture.nativeElement.querySelector('.quantity-selector');
    expect(quantitySelector).toBeTruthy();

    mockProductService.isInStock.and.returnValue(false);
    fixture.detectChanges();

    quantitySelector = fixture.nativeElement.querySelector('.quantity-selector');
    expect(quantitySelector).toBeFalsy();
  });

  it('should handle product route parameter changes', () => {
    mockActivatedRoute.params = of({ productId: '2' });

    fixture.detectChanges();

    expect(mockProductService.getProduct).toHaveBeenCalledWith('2');
  });

  it('should cleanup on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    fixture.destroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});