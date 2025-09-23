import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductCardComponent } from './product-card.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product.interface';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    _id: '1',
    name: 'Test Product',
    description: 'This is a test product with a long description that should be truncated in the card view',
    price: 99.99,
    category: 'Electronics',
    images: ['image1.jpg', 'image2.jpg'],
    inventory: 10,
    isActive: true,
    weight: 2.5,
    dimensions: { length: 10, width: 8, height: 3 },
    tags: ['test', 'electronics'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'isInStock',
      'getStockStatus',
      'getStockStatusColor'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductCardComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    mockProductService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mock returns
    mockProductService.isInStock.and.returnValue(true);
    mockProductService.getStockStatus.and.returnValue('In Stock');
    mockProductService.getStockStatusColor.and.returnValue('primary');

    component.product = mockProduct;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product information correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('.product-name').textContent).toContain('Test Product');
    expect(compiled.querySelector('.price').textContent).toContain('$99.99');
    expect(compiled.querySelector('.product-description').textContent).toContain('This is a test product');
  });

  it('should truncate long descriptions', () => {
    const compiled = fixture.nativeElement;
    const description = compiled.querySelector('.product-description').textContent;

    expect(description.length).toBeLessThanOrEqual(103); // 100 chars + "..."
    expect(description).toContain('...');
  });

  it('should show correct stock status', () => {
    const compiled = fixture.nativeElement;

    expect(mockProductService.getStockStatus).toHaveBeenCalledWith(mockProduct);
    expect(compiled.querySelector('.stock-chip').textContent).toContain('In Stock');
  });

  it('should handle out of stock products', () => {
    mockProductService.isInStock.and.returnValue(false);
    mockProductService.getStockStatus.and.returnValue('Out of Stock');
    mockProductService.getStockStatusColor.and.returnValue('warn');

    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const addToCartButton = compiled.querySelector('button[matTooltip="Add to Cart"]');

    expect(addToCartButton.disabled).toBe(true);
    expect(compiled.querySelector('.product-card')).toHaveClass('out-of-stock');
  });

  it('should show inventory warning for low stock', () => {
    const lowStockProduct = { ...mockProduct, inventory: 3 };
    component.product = lowStockProduct;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.inventory').textContent).toContain('Only 3 left');
  });

  it('should not show inventory warning for high stock', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.inventory')).toBeNull();
  });

  it('should emit addToCart event when add to cart is clicked', () => {
    spyOn(component.addToCart, 'emit');

    const addToCartButton = fixture.nativeElement.querySelector('button[matTooltip="Add to Cart"]');
    addToCartButton.click();

    expect(component.addToCart.emit).toHaveBeenCalledWith(mockProduct);
  });

  it('should not emit addToCart event when product is out of stock', () => {
    mockProductService.isInStock.and.returnValue(false);
    spyOn(component.addToCart, 'emit');

    component.onAddToCart();

    expect(component.addToCart.emit).not.toHaveBeenCalled();
  });

  it('should emit quickView event when quick view is clicked', () => {
    spyOn(component.quickView, 'emit');

    component.onMouseEnter();
    fixture.detectChanges();

    const quickViewButton = fixture.nativeElement.querySelector('.quick-view-btn');
    quickViewButton.click();

    expect(component.quickView.emit).toHaveBeenCalledWith(mockProduct);
  });

  it('should show hover overlay on mouse enter', () => {
    component.onMouseEnter();
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.image-overlay');
    expect(overlay).toHaveClass('visible');
  });

  it('should hide hover overlay on mouse leave', () => {
    component.onMouseEnter();
    fixture.detectChanges();

    component.onMouseLeave();
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.image-overlay');
    expect(overlay).not.toHaveClass('visible');
  });

  it('should handle image error by showing placeholder', () => {
    const mockEvent = {
      target: { src: '' }
    };

    component.onImageError(mockEvent);

    expect(mockEvent.target.src).toBe('/assets/images/product-placeholder.jpg');
  });

  it('should set current image from product images', () => {
    component.ngOnInit();

    expect(component.currentImage).toBe('image1.jpg');
  });

  it('should use placeholder image when no product images', () => {
    const productWithoutImages = { ...mockProduct, images: [] };
    component.product = productWithoutImages;

    component.ngOnInit();

    expect(component.currentImage).toBe('/assets/images/product-placeholder.jpg');
  });

  it('should prevent event propagation in quick view', () => {
    const mockEvent = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);
    spyOn(component.quickView, 'emit');

    component.onQuickView(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.quickView.emit).toHaveBeenCalledWith(mockProduct);
  });

  it('should have correct router links', () => {
    const compiled = fixture.nativeElement;
    const productLinks = compiled.querySelectorAll('[routerLink]');

    productLinks.forEach(link => {
      expect(link.getAttribute('routerLink')).toBe('/products,1');
    });
  });

  it('should display correct price format', () => {
    const compiled = fixture.nativeElement;
    const priceElement = compiled.querySelector('.price');

    expect(priceElement.textContent).toBe('$99.99');
  });

  it('should apply hover effects on card', () => {
    const cardElement = fixture.nativeElement.querySelector('.product-card');

    // Simulate mouseenter
    cardElement.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    expect(component.isHovered).toBe(true);

    // Simulate mouseleave
    cardElement.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();

    expect(component.isHovered).toBe(false);
  });
});