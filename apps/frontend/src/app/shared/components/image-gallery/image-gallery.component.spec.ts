import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ImageGalleryComponent } from './image-gallery.component';

describe('ImageGalleryComponent', () => {
  let component: ImageGalleryComponent;
  let fixture: ComponentFixture<ImageGalleryComponent>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;

  const mockImages = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg'
  ];

  beforeEach(async () => {
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [ImageGalleryComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageGalleryComponent);
    component = fixture.componentInstance;
    mockMatDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    component.images = mockImages;
    component.altText = 'Test product';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with first image', () => {
    component.ngOnInit();

    expect(component.currentIndex).toBe(0);
    expect(component.currentImage).toBe('image1.jpg');
  });

  it('should initialize with custom initial index', () => {
    component.initialIndex = 1;
    component.ngOnInit();

    expect(component.currentIndex).toBe(1);
    expect(component.currentImage).toBe('image2.jpg');
  });

  it('should clamp initial index to valid range', () => {
    component.initialIndex = 10;
    component.ngOnInit();

    expect(component.currentIndex).toBe(2); // Last valid index
  });

  it('should display main image', () => {
    fixture.detectChanges();

    const mainImage = fixture.nativeElement.querySelector('.main-image');
    expect(mainImage).toBeTruthy();
    expect(mainImage.src).toContain('image1.jpg');
    expect(mainImage.alt).toBe('Test product');
  });

  it('should display thumbnails when multiple images', () => {
    fixture.detectChanges();

    const thumbnails = fixture.nativeElement.querySelectorAll('.thumbnail');
    expect(thumbnails.length).toBe(3);
  });

  it('should not display thumbnails for single image', () => {
    component.images = ['single-image.jpg'];
    fixture.detectChanges();

    const thumbnailContainer = fixture.nativeElement.querySelector('.thumbnail-container');
    expect(thumbnailContainer).toBeFalsy();
  });

  it('should select image when thumbnail clicked', () => {
    spyOn(component.imageChange, 'emit');
    fixture.detectChanges();

    const secondThumbnail = fixture.nativeElement.querySelectorAll('.thumbnail-wrapper')[1];
    secondThumbnail.click();

    expect(component.currentIndex).toBe(1);
    expect(component.currentImage).toBe('image2.jpg');
    expect(component.imageChange.emit).toHaveBeenCalledWith({
      index: 1,
      image: 'image2.jpg'
    });
  });

  it('should navigate to previous image', () => {
    component.currentIndex = 1;
    component.updateCurrentImage();
    spyOn(component.imageChange, 'emit');

    component.previousImage();

    expect(component.currentIndex).toBe(0);
    expect(component.imageChange.emit).toHaveBeenCalled();
  });

  it('should navigate to next image', () => {
    spyOn(component.imageChange, 'emit');

    component.nextImage();

    expect(component.currentIndex).toBe(1);
    expect(component.imageChange.emit).toHaveBeenCalled();
  });

  it('should not navigate beyond first image', () => {
    component.currentIndex = 0;

    component.previousImage();

    expect(component.currentIndex).toBe(0);
  });

  it('should not navigate beyond last image', () => {
    component.currentIndex = 2;

    component.nextImage();

    expect(component.currentIndex).toBe(2);
  });

  it('should show navigation buttons for multiple images', () => {
    fixture.detectChanges();

    const prevButton = fixture.nativeElement.querySelector('.prev-button');
    const nextButton = fixture.nativeElement.querySelector('.next-button');

    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
  });

  it('should disable previous button on first image', () => {
    component.currentIndex = 0;
    fixture.detectChanges();

    const prevButton = fixture.nativeElement.querySelector('.prev-button');
    expect(prevButton.disabled).toBe(true);
  });

  it('should disable next button on last image', () => {
    component.currentIndex = 2;
    fixture.detectChanges();

    const nextButton = fixture.nativeElement.querySelector('.next-button');
    expect(nextButton.disabled).toBe(true);
  });

  it('should show image counter', () => {
    component.currentIndex = 1;
    fixture.detectChanges();

    const counter = fixture.nativeElement.querySelector('.image-counter');
    expect(counter).toBeTruthy();
    expect(counter.textContent.trim()).toBe('2 / 3');
  });

  it('should show zoom button on hover', () => {
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.image-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should open zoom dialog when zoom button clicked', () => {
    const mockDialogRef = {
      afterClosed: () => ({ subscribe: jasmine.createSpy() })
    };
    mockMatDialog.open.and.returnValue(mockDialogRef as any);

    component.openZoomDialog();

    expect(mockMatDialog.open).toHaveBeenCalled();
  });

  it('should handle image load event', () => {
    component.imageLoading = true;

    component.onImageLoad();

    expect(component.imageLoading).toBe(false);
  });

  it('should handle image error by showing placeholder', () => {
    const mockEvent = {
      target: { src: '' }
    };

    component.onImageError(mockEvent);

    expect(mockEvent.target.src).toBe('/assets/images/product-placeholder.jpg');
    expect(component.imageLoading).toBe(false);
  });

  it('should handle thumbnail error by showing placeholder', () => {
    const mockEvent = {
      target: { src: '' }
    };

    component.onThumbnailError(mockEvent);

    expect(mockEvent.target.src).toBe('/assets/images/product-placeholder.jpg');
  });

  it('should track images by URL', () => {
    const trackingResult = component.trackByImage(0, 'image1.jpg');

    expect(trackingResult).toBe('image1.jpg');
  });

  it('should not render when no images provided', () => {
    component.images = [];
    fixture.detectChanges();

    const gallery = fixture.nativeElement.querySelector('.image-gallery');
    expect(gallery).toBeFalsy();
  });

  it('should handle undefined images array', () => {
    component.images = undefined as any;
    fixture.detectChanges();

    const gallery = fixture.nativeElement.querySelector('.image-gallery');
    expect(gallery).toBeFalsy();
  });

  it('should mark active thumbnail', () => {
    component.currentIndex = 1;
    fixture.detectChanges();

    const thumbnails = fixture.nativeElement.querySelectorAll('.thumbnail-wrapper');
    expect(thumbnails[1]).toHaveClass('active');
    expect(thumbnails[0]).not.toHaveClass('active');
    expect(thumbnails[2]).not.toHaveClass('active');
  });

  it('should show loading indicator when image is loading', () => {
    component.imageLoading = true;
    fixture.detectChanges();

    const loadingIndicator = fixture.nativeElement.querySelector('.loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });

  it('should hide loading indicator when image is loaded', () => {
    component.imageLoading = false;
    fixture.detectChanges();

    const loadingIndicator = fixture.nativeElement.querySelector('.loading-indicator');
    expect(loadingIndicator).toBeFalsy();
  });
});