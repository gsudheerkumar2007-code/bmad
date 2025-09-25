import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { SearchBarComponent } from './search-bar.component';
import { ProductService } from '../../../features/products/services/product.service';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductService', ['getSearchSuggestions']);

    await TestBed.configureTestingModule({
      imports: [SearchBarComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty values', () => {
    expect(component.searchTerm).toBe('');
    expect(component.suggestions).toEqual([]);
    expect(component.isLoading).toBe(false);
  });

  it('should use initial value if provided', () => {
    component.initialValue = 'test search';
    component.ngOnInit();
    expect(component.searchTerm).toBe('test search');
  });

  it('should emit search event with trimmed value', () => {
    spyOn(component.search, 'emit');
    component.searchTerm = '  test search  ';

    component.onSearch();

    expect(component.search.emit).toHaveBeenCalledWith('test search');
  });

  it('should not emit search event for empty/whitespace only values', () => {
    spyOn(component.search, 'emit');
    component.searchTerm = '   ';

    component.onSearch();

    expect(component.search.emit).not.toHaveBeenCalled();
  });

  it('should emit suggestionSelected event', () => {
    spyOn(component.suggestionSelected, 'emit');
    const suggestion = 'test suggestion';

    component.onSuggestionSelect(suggestion);

    expect(component.suggestionSelected.emit).toHaveBeenCalledWith(suggestion);
    expect(component.searchTerm).toBe(suggestion);
    expect(component.suggestions).toEqual([]);
  });

  it('should clear search and emit empty string', () => {
    spyOn(component.search, 'emit');
    component.searchTerm = 'test';
    component.suggestions = ['suggestion1', 'suggestion2'];

    component.clearSearch();

    expect(component.searchTerm).toBe('');
    expect(component.suggestions).toEqual([]);
    expect(component.search.emit).toHaveBeenCalledWith('');
  });

  it('should handle enter key press', () => {
    spyOn(component, 'onSearch');
    const event = new KeyboardEvent('keypress', { key: 'Enter' });
    spyOn(event, 'preventDefault');

    component.onKeyPress(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.onSearch).toHaveBeenCalled();
  });

  it('should not handle other key presses', () => {
    spyOn(component, 'onSearch');
    const event = new KeyboardEvent('keypress', { key: 'a' });

    component.onKeyPress(event);

    expect(component.onSearch).not.toHaveBeenCalled();
  });

  it('should get search suggestions for valid input', () => {
    const mockSuggestions = { suggestions: ['suggestion1', 'suggestion2'], query: 'test' };
    productServiceSpy.getSearchSuggestions.and.returnValue(of(mockSuggestions));

    component.ngOnInit();
    component.onInputChange('test');

    fixture.detectChanges();

    setTimeout(() => {
      expect(productServiceSpy.getSearchSuggestions).toHaveBeenCalledWith('test', 10);
      expect(component.suggestions).toEqual(['suggestion1', 'suggestion2']);
    }, 350); // Wait for debounce
  });

  it('should not get suggestions for short input', () => {
    component.ngOnInit();
    component.onInputChange('a');

    fixture.detectChanges();

    setTimeout(() => {
      expect(productServiceSpy.getSearchSuggestions).not.toHaveBeenCalled();
      expect(component.suggestions).toEqual([]);
    }, 350);
  });

  it('should handle search suggestions error gracefully', () => {
    productServiceSpy.getSearchSuggestions.and.returnValue(
      throwError(() => new Error('Service error'))
    );
    spyOn(console, 'warn');

    component.ngOnInit();
    component.onInputChange('test');

    fixture.detectChanges();

    setTimeout(() => {
      expect(console.warn).toHaveBeenCalledWith('Search suggestions failed:', jasmine.any(Error));
      expect(component.suggestions).toEqual([]);
      expect(component.isLoading).toBe(false);
    }, 350);
  });

  it('should clean up subscriptions on destroy', () => {
    component.ngOnInit();
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});