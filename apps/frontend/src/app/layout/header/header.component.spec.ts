import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/services/auth.service';

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
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      createdAt: new Date()
    };

    mockAuthService.currentUser$ = of(mockUser);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.user-btn')).toBeTruthy();
    expect(compiled.querySelector('.user-name')?.textContent).toContain('John');
  });

  it('should call logout when logout menu item is clicked', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      createdAt: new Date()
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
    spyOn(console, 'log');
    component.onSearch('test search');
    expect(console.log).toHaveBeenCalledWith('Search:', 'test search');
  });

  it('should handle empty search input', () => {
    spyOn(console, 'log');
    component.onSearch('   ');
    expect(console.log).not.toHaveBeenCalled();
  });
});