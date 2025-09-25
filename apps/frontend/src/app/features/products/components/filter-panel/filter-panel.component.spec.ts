import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { FilterPanelComponent } from './filter-panel.component';
import { ProductService } from '../../services/product.service';
import { CategoryInfo, PriceRange } from '../../interfaces/product.interface';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockCategories: CategoryInfo[] = [
    { name: 'Electronics', count: 10 },
    { name: 'Books', count: 5 },
    { name: 'Clothing', count: 8 }
  ];

  const mockPriceRange: PriceRange = { min: 10, max: 1000 };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductService', ['getCategories', 'getPriceRange']);

    await TestBed.configureTestingModule({
      imports: [FilterPanelComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;

    // Setup default mock returns
    productServiceSpy.getCategories.and.returnValue(
      of({ categories: mockCategories })
    );
    productServiceSpy.getPriceRange.and.returnValue(
      of({ priceRange: mockPriceRange })
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    component.ngOnInit();

    expect(productServiceSpy.getCategories).toHaveBeenCalled();
    expect(component.availableCategories).toEqual(mockCategories);
    expect(component.isLoadingCategories).toBe(false);
  });

  it('should load price range on init', () => {
    component.ngOnInit();

    expect(productServiceSpy.getPriceRange).toHaveBeenCalled();
    expect(component.globalPriceRange).toEqual(mockPriceRange);
    expect(component.isLoadingPriceRange).toBe(false);
  });

  it('should handle category loading error', () => {
    productServiceSpy.getCategories.and.returnValue(
      throwError(() => new Error('Service error'))
    );
    spyOn(console, 'error');

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Failed to load categories:', jasmine.any(Error));
    expect(component.isLoadingCategories).toBe(false);
  });

  it('should handle price range loading error', () => {
    productServiceSpy.getPriceRange.and.returnValue(
      throwError(() => new Error('Service error'))
    );
    spyOn(console, 'error');

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Failed to load price range:', jasmine.any(Error));
    expect(component.isLoadingPriceRange).toBe(false);
  });

  it('should emit filters when category selection changes', () => {
    spyOn(component.filtersChange, 'emit');
    const category = 'Electronics';

    component.onCategoryChange(category, true);

    expect(component.filters.categories).toContain(category);
    expect(component.filtersChange.emit).toHaveBeenCalledWith(component.filters);
  });

  it('should remove category when unchecked', () => {
    spyOn(component.filtersChange, 'emit');
    component.filters.categories = ['Electronics', 'Books'];

    component.onCategoryChange('Electronics', false);

    expect(component.filters.categories).toEqual(['Books']);
    expect(component.filtersChange.emit).toHaveBeenCalledWith(component.filters);
  });

  it('should emit filters when price range changes', () => {
    spyOn(component.filtersChange, 'emit');
    component.localPriceRange = { min: 50, max: 500 };

    component.onPriceRangeChange();

    expect(component.filters.priceRange).toEqual({ min: 50, max: 500 });
    expect(component.filtersChange.emit).toHaveBeenCalledWith(component.filters);
  });

  it('should handle min price input', () => {
    spyOn(component, 'onPriceRangeChange');
    component.globalPriceRange = { min: 10, max: 1000 };

    component.onMinPriceInput('50');

    expect(component.localPriceRange.min).toBe(50);
    expect(component.onPriceRangeChange).toHaveBeenCalled();
  });

  it('should constrain min price to global minimum', () => {
    spyOn(component, 'onPriceRangeChange');
    component.globalPriceRange = { min: 10, max: 1000 };

    component.onMinPriceInput('5');

    expect(component.localPriceRange.min).toBe(10);
  });

  it('should handle max price input', () => {
    spyOn(component, 'onPriceRangeChange');
    component.globalPriceRange = { min: 10, max: 1000 };

    component.onMaxPriceInput('500');

    expect(component.localPriceRange.max).toBe(500);
    expect(component.onPriceRangeChange).toHaveBeenCalled();
  });

  it('should constrain max price to global maximum', () => {
    spyOn(component, 'onPriceRangeChange');
    component.globalPriceRange = { min: 10, max: 1000 };

    component.onMaxPriceInput('1500');

    expect(component.localPriceRange.max).toBe(1000);
  });

  it('should emit filters on sort change', () => {
    spyOn(component.filtersChange, 'emit');

    component.onSortChange();

    expect(component.filtersChange.emit).toHaveBeenCalledWith(component.filters);
  });

  it('should remove category using removeCategory method', () => {
    spyOn(component, 'onCategoryChange');

    component.removeCategory('Electronics');

    expect(component.onCategoryChange).toHaveBeenCalledWith('Electronics', false);
  });

  it('should clear all filters', () => {
    spyOn(component.clearFilters, 'emit');
    component.globalPriceRange = { min: 10, max: 1000 };
    component.filters.categories = ['Electronics'];
    component.filters.sortBy = 'price';

    component.onClearAllFilters();

    expect(component.filters.categories).toEqual([]);
    expect(component.filters.sortBy).toBe('relevance');
    expect(component.filters.priceRange).toEqual({ min: 10, max: 1000 });
    expect(component.clearFilters.emit).toHaveBeenCalled();
  });

  it('should check if category is selected', () => {
    component.filters.categories = ['Electronics', 'Books'];

    expect(component.isCategorySelected('Electronics')).toBe(true);
    expect(component.isCategorySelected('Clothing')).toBe(false);
  });

  it('should count applied filters correctly', () => {
    component.globalPriceRange = { min: 10, max: 1000 };
    component.filters.categories = ['Electronics'];
    component.filters.priceRange = { min: 50, max: 500 };
    component.filters.sortBy = 'price';

    const count = component.getAppliedFiltersCount();

    expect(count).toBe(3); // categories, price range, sort
  });

  it('should get sort label correctly', () => {
    expect(component.getSortLabel('price')).toBe('Price');
    expect(component.getSortLabel('relevance')).toBe('Relevance');
    expect(component.getSortLabel('unknown')).toBe('unknown');
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});