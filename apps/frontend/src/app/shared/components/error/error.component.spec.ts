import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockActivatedRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [
        ErrorComponent,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default error properties', () => {
    expect(component.errorMessage).toBe('Something went wrong');
    expect(component.errorCode).toBe('500');
    expect(component.errorDetails).toContain('unexpected error');
  });

  it('should update error details from query parameters', () => {
    mockActivatedRoute.queryParams = of({
      message: 'Custom error message',
      code: '404',
      details: 'Custom error details'
    });

    component.ngOnInit();

    expect(component.errorMessage).toBe('Custom error message');
    expect(component.errorCode).toBe('404');
    expect(component.errorDetails).toBe('Custom error details');
  });

  it('should reload page when onRetry is called', () => {
    spyOn(window.location, 'reload');
    component.onRetry();
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should call history.back when onGoBack is called', () => {
    spyOn(window.history, 'back');
    component.onGoBack();
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should log error report when onReportError is called', () => {
    spyOn(console, 'log');
    component.onReportError();
    expect(console.log).toHaveBeenCalledWith('Error reported:', jasmine.any(Object));
  });

  it('should generate unique error ID', () => {
    const errorId1 = component.generateErrorId();
    const errorId2 = component.generateErrorId();

    expect(errorId1).toMatch(/^ERR-\d+-[a-z0-9]+$/);
    expect(errorId2).toMatch(/^ERR-\d+-[a-z0-9]+$/);
    expect(errorId1).not.toBe(errorId2);
  });

  it('should return current time string', () => {
    const timeString = component.getCurrentTime();
    expect(typeof timeString).toBe('string');
    expect(timeString.length).toBeGreaterThan(0);
  });

  it('should display error code and message', () => {
    component.errorCode = '404';
    component.errorMessage = 'Test error message';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('404');
    expect(compiled.textContent).toContain('Test error message');
  });

  it('should display retry and go back buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const retryButton = compiled.querySelector('.retry-btn');
    const backButton = compiled.querySelector('.back-btn');

    expect(retryButton).toBeTruthy();
    expect(backButton).toBeTruthy();
  });

  it('should handle empty query parameters', () => {
    mockActivatedRoute.queryParams = of({});
    component.ngOnInit();

    expect(component.errorMessage).toBe('Something went wrong');
    expect(component.errorCode).toBe('500');
  });
});