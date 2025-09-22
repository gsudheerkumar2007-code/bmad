import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current year in copyright', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentYear = new Date().getFullYear();
    expect(compiled.textContent).toContain(currentYear.toString());
  });

  it('should display company logo and name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.company-logo h3')?.textContent).toContain('E-Commerce');
  });

  it('should render all footer sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = compiled.querySelectorAll('.footer-section');
    expect(sections.length).toBeGreaterThanOrEqual(4);
  });

  it('should display social media links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const socialLinks = compiled.querySelectorAll('.social-btn');
    expect(socialLinks.length).toBe(4);
  });

  it('should open social links in new window', () => {
    spyOn(window, 'open');
    component.onSocialLinkClick('https://facebook.com');
    expect(window.open).toHaveBeenCalledWith('https://facebook.com', '_blank', 'noopener,noreferrer');
  });

  it('should display contact information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('support@ecommerce.com');
    expect(compiled.textContent).toContain('1-800-SHOP-NOW');
  });

  it('should render all quick links', () => {
    expect(component.quickLinks.length).toBe(4);
    expect(component.quickLinks[0].label).toBe('Home');
    expect(component.quickLinks[0].route).toBe('/');
  });

  it('should render all customer service links', () => {
    expect(component.customerServiceLinks.length).toBe(4);
    expect(component.customerServiceLinks[0].label).toBe('Help Center');
  });

  it('should render all legal links', () => {
    expect(component.legalLinks.length).toBe(4);
    expect(component.legalLinks[0].label).toBe('Privacy Policy');
  });
});