import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSkeletonComponent } from './loading-skeleton.component';

describe('LoadingSkeletonComponent', () => {
  let component: LoadingSkeletonComponent;
  let fixture: ComponentFixture<LoadingSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSkeletonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSkeletonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default dimensions', () => {
    fixture.detectChanges();

    const skeletonElement = fixture.nativeElement.querySelector('.skeleton');

    expect(skeletonElement.style.width).toBe('100%');
    expect(skeletonElement.style.height).toBe('20px');
    expect(skeletonElement.style.borderRadius).toBe('4px');
  });

  it('should apply custom dimensions', () => {
    component.width = '200px';
    component.height = '50px';
    component.borderRadius = '8px';
    fixture.detectChanges();

    const skeletonElement = fixture.nativeElement.querySelector('.skeleton');

    expect(skeletonElement.style.width).toBe('200px');
    expect(skeletonElement.style.height).toBe('50px');
    expect(skeletonElement.style.borderRadius).toBe('8px');
  });

  it('should apply additional CSS classes', () => {
    component.additionalClasses = 'skeleton-text custom-class';
    fixture.detectChanges();

    const skeletonElement = fixture.nativeElement.querySelector('.skeleton');

    expect(skeletonElement).toHaveClass('skeleton-text');
    expect(skeletonElement).toHaveClass('custom-class');
  });

  it('should have skeleton animation', () => {
    fixture.detectChanges();

    const skeletonElement = fixture.nativeElement.querySelector('.skeleton');
    const computedStyle = window.getComputedStyle(skeletonElement);

    expect(computedStyle.animationName).toContain('loading');
  });

  it('should render with minimal markup', () => {
    fixture.detectChanges();

    const skeletonElements = fixture.nativeElement.querySelectorAll('.skeleton');
    expect(skeletonElements.length).toBe(1);
  });
});

describe('ProductCardSkeletonComponent', () => {
  let component: any;
  let fixture: ComponentFixture<any>;

  beforeEach(async () => {
    const { ProductCardSkeletonComponent } = await import('./product-card-skeleton.component');

    await TestBed.configureTestingModule({
      imports: [ProductCardSkeletonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardSkeletonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render product card skeleton structure', () => {
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.querySelector('mat-card');
    expect(cardElement).toBeTruthy();

    const imageContainer = fixture.nativeElement.querySelector('.skeleton-image-container');
    expect(imageContainer).toBeTruthy();

    const contentContainer = fixture.nativeElement.querySelector('.skeleton-content');
    expect(contentContainer).toBeTruthy();

    const footerContainer = fixture.nativeElement.querySelector('.skeleton-footer');
    expect(footerContainer).toBeTruthy();
  });

  it('should have correct skeleton elements count', () => {
    fixture.detectChanges();

    const skeletonElements = fixture.nativeElement.querySelectorAll('app-loading-skeleton');
    expect(skeletonElements.length).toBe(5); // Image + title + 2 text lines + price + button
  });

  it('should have proper skeleton classes applied', () => {
    fixture.detectChanges();

    const titleSkeleton = fixture.nativeElement.querySelector('app-loading-skeleton[additionalClasses*="skeleton-title"]');
    expect(titleSkeleton).toBeTruthy();

    const textSkeletons = fixture.nativeElement.querySelectorAll('app-loading-skeleton[additionalClasses*="skeleton-text"]');
    expect(textSkeletons.length).toBe(3); // 2 description lines + price

    const buttonSkeleton = fixture.nativeElement.querySelector('app-loading-skeleton[additionalClasses*="skeleton-button"]');
    expect(buttonSkeleton).toBeTruthy();

    const imageSkeleton = fixture.nativeElement.querySelector('app-loading-skeleton[additionalClasses*="skeleton-image"]');
    expect(imageSkeleton).toBeTruthy();
  });

  it('should have correct card height', () => {
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.querySelector('.product-card-skeleton');
    const computedStyle = window.getComputedStyle(cardElement);

    expect(computedStyle.height).toBe('350px');
  });

  it('should maintain proper spacing between elements', () => {
    fixture.detectChanges();

    const contentElement = fixture.nativeElement.querySelector('.skeleton-content');
    const computedStyle = window.getComputedStyle(contentElement);

    expect(computedStyle.padding).toBe('16px');
  });
});