import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoadingComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default properties', () => {
    expect(component.type).toBe('spinner');
    expect(component.size).toBe('medium');
    expect(component.message).toBe('Loading...');
    expect(component.overlay).toBe(false);
  });

  it('should calculate spinner diameter correctly', () => {
    component.size = 'small';
    expect(component.spinnerDiameter).toBe(24);

    component.size = 'medium';
    expect(component.spinnerDiameter).toBe(40);

    component.size = 'large';
    expect(component.spinnerDiameter).toBe(60);
  });

  it('should display loading message', () => {
    component.message = 'Custom loading message';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Custom loading message');
  });

  it('should accept custom type input', () => {
    component.type = 'bar';
    expect(component.type).toBe('bar');

    component.type = 'skeleton';
    expect(component.type).toBe('skeleton');
  });

  it('should accept progress value for progress bar', () => {
    component.value = 50;
    expect(component.value).toBe(50);
  });

  it('should handle overlay mode', () => {
    component.overlay = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.overlay')).toBeTruthy();
  });

  it('should show spinner by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-spinner')).toBeTruthy();
  });
});