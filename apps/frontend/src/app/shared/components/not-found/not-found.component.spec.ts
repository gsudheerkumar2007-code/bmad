import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display helpful links', () => {
    expect(component.helpfulLinks.length).toBe(4);
    expect(component.helpfulLinks[0].label).toBe('Go to Home');
    expect(component.helpfulLinks[0].route).toBe('/');
    expect(component.helpfulLinks[0].icon).toBe('home');
  });

  it('should render all helpful links in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkButtons = compiled.querySelectorAll('.helpful-link');
    expect(linkButtons.length).toBe(4);
  });

  it('should display correct link labels', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Go to Home');
    expect(compiled.textContent).toContain('Browse Products');
    expect(compiled.textContent).toContain('Help Center');
    expect(compiled.textContent).toContain('Contact Support');
  });

  it('should call history.back when onGoBack is called', () => {
    spyOn(window.history, 'back');
    component.onGoBack();
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should display 404 error message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('404');
  });

  it('should display page not found message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Page Not Found');
  });

  it('should have router links for navigation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const routerLinks = compiled.querySelectorAll('[routerLink]');
    expect(routerLinks.length).toBeGreaterThan(0);
  });
});