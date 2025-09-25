import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { AuthService, User } from '../../core/services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of(null)
    });

    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe'], {
      observe: jasmine.createSpy().and.returnValue(of({ matches: false }))
    });

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display logo and brand name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo-text')?.textContent).toContain('E-Commerce');
  });

  it('should show login button when user is not authenticated', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.login-btn')).toBeTruthy();
  });

  it('should show user menu when user is authenticated', () => {
    const mockUser: User = {
      _id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockAuthService.currentUser$ = of(mockUser);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.user-btn')).toBeTruthy();
    expect(compiled.querySelector('.user-name')?.textContent).toContain('John');
  });

  it('should call logout when logout menu item is clicked', () => {
    const mockUser: User = {
      _id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockAuthService.currentUser$ = of(mockUser);
    fixture.detectChanges();

    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should display cart icon with badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cart-btn')).toBeTruthy();
  });

  it('should handle search input', () => {
    // onSearch method should execute without errors for valid input
    expect(() => component.onSearch('test search')).not.toThrow();
  });

  it('should handle empty search input', () => {
    // onSearch method should execute without errors for empty input
    expect(() => component.onSearch('   ')).not.toThrow();
  });

  it('should test the header component dialog position when opened', () => {
    const mockUser: User = {
      _id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockAuthService.currentUser$ = of(mockUser);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const userMenuTrigger = compiled.querySelector('[matMenuTriggerFor]') as HTMLElement;

    expect(userMenuTrigger).toBeTruthy();

    // Verify menu has proper positioning attributes
    const matMenu = compiled.querySelector('mat-menu');
    expect(matMenu).toBeTruthy();
    expect(matMenu?.getAttribute('xposition')).toBe('before');
    expect(matMenu?.getAttribute('yposition')).toBe('below');

    // Simulate menu trigger click
    userMenuTrigger.click();
    fixture.detectChanges();

    // Verify menu trigger is positioned correctly within the header
    const menuTriggerRect = userMenuTrigger.getBoundingClientRect();
    expect(menuTriggerRect.height).toBeGreaterThan(0);
    expect(menuTriggerRect.width).toBeGreaterThan(0);

    // Menu trigger should be properly positioned within the header toolbar
    expect(userMenuTrigger.offsetParent).toBeTruthy();

    // Verify menu trigger has proper CSS class for styling
    expect(userMenuTrigger.classList.contains('user-btn')).toBe(true);
  });
});