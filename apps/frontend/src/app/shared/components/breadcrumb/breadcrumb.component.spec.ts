import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbService, BreadcrumbItem } from '../../services/breadcrumb.service';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let mockBreadcrumbService: jasmine.SpyObj<BreadcrumbService>;

  const mockBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', url: '/', isClickable: true },
    { label: 'Products', url: '/products', isClickable: true },
    { label: 'Electronics', url: '/products/electronics', isClickable: false }
  ];

  beforeEach(async () => {
    mockBreadcrumbService = jasmine.createSpyObj('BreadcrumbService', [], {
      breadcrumbs$: of(mockBreadcrumbs)
    });

    await TestBed.configureTestingModule({
      imports: [
        BreadcrumbComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: BreadcrumbService, useValue: mockBreadcrumbService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display breadcrumb items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const breadcrumbItems = compiled.querySelectorAll('.breadcrumb-item');
    expect(breadcrumbItems.length).toBe(3);
  });

  it('should display home icon for first breadcrumb', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const homeIcon = compiled.querySelector('.home-icon');
    expect(homeIcon).toBeTruthy();
  });

  it('should show clickable links for navigable items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const clickableLinks = compiled.querySelectorAll('.breadcrumb-link');
    expect(clickableLinks.length).toBe(2); // Home and Products are clickable
  });

  it('should show current page span for non-clickable items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentSpan = compiled.querySelector('.breadcrumb-current');
    expect(currentSpan).toBeTruthy();
    expect(currentSpan?.textContent?.trim()).toContain('Electronics');
  });

  it('should display separators between items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const separators = compiled.querySelectorAll('.breadcrumb-separator');
    expect(separators.length).toBe(2); // One less than total items
  });

  it('should handle breadcrumb click', () => {
    spyOn(console, 'log');
    const breadcrumbItem = mockBreadcrumbs[0];
    component.onBreadcrumbClick(breadcrumbItem);
    expect(console.log).toHaveBeenCalledWith(`Navigating to: ${breadcrumbItem.url}`);
  });

  it('should not log navigation for non-clickable items', () => {
    spyOn(console, 'log');
    const breadcrumbItem = mockBreadcrumbs[2]; // Non-clickable item
    component.onBreadcrumbClick(breadcrumbItem);
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should handle empty breadcrumbs', () => {
    mockBreadcrumbService.breadcrumbs$ = of([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const breadcrumbItems = compiled.querySelectorAll('.breadcrumb-item');
    expect(breadcrumbItems.length).toBe(0);
  });
});