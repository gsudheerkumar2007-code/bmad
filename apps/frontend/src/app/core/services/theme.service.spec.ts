import { TestBed } from '@angular/core/testing';
import { ThemeService, ThemeMode } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener')
      })
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with auto theme mode by default', () => {
    expect(service.getCurrentThemeMode()).toBe('auto');
  });

  it('should save and retrieve theme mode from localStorage', () => {
    service.setThemeMode('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('ecommerce-theme-mode', 'dark');
    expect(service.getCurrentThemeMode()).toBe('dark');
  });

  it('should fall back to auto mode when localStorage has invalid value', () => {
    mockLocalStorage['ecommerce-theme-mode'] = 'invalid-mode';
    const newService = TestBed.inject(ThemeService);
    expect(newService.getCurrentThemeMode()).toBe('auto');
  });

  it('should toggle theme correctly', () => {
    service.setThemeMode('light');
    service.toggleTheme();
    expect(service.getCurrentThemeMode()).toBe('dark');

    service.toggleTheme();
    expect(service.getCurrentThemeMode()).toBe('light');
  });

  it('should handle auto mode toggle based on current appearance', () => {
    service.setThemeMode('auto');
    // Mock isDark to false (light appearance)
    spyOn(service, 'getCurrentIsDark').and.returnValue(false);

    service.toggleTheme();
    expect(service.getCurrentThemeMode()).toBe('dark');
  });

  it('should update DOM body class when theme changes', () => {
    const body = document.body;

    service.setThemeMode('dark');
    expect(body.classList.contains('dark-theme')).toBe(true);

    service.setThemeMode('light');
    expect(body.classList.contains('dark-theme')).toBe(false);
  });

  it('should provide theme colors', () => {
    const lightColors = service.getThemeColors();
    expect(lightColors.primary).toBeDefined();
    expect(lightColors.background).toBeDefined();
    expect(lightColors.text.primary).toBeDefined();
  });

  it('should reset to system default', () => {
    service.setThemeMode('dark');
    service.resetToSystemDefault();
    expect(service.getCurrentThemeMode()).toBe('auto');
  });

  it('should handle system theme changes when in auto mode', () => {
    const mockMediaQuery = {
      matches: true,
      addEventListener: jasmine.createSpy('addEventListener')
    };

    (window.matchMedia as jasmine.Spy).and.returnValue(mockMediaQuery);

    service.setThemeMode('auto');

    // Simulate system theme change
    const changeHandler = mockMediaQuery.addEventListener.calls.argsFor(0)[1];
    changeHandler({ matches: false });

    expect(service.getCurrentIsDark()).toBe(false);
  });

  it('should handle localStorage errors gracefully', () => {
    (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
    (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');

    expect(() => service.setThemeMode('dark')).not.toThrow();
    expect(() => TestBed.inject(ThemeService)).not.toThrow();
  });
});