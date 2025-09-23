import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <div class="image-gallery" *ngIf="images?.length">
      <!-- Main Image Display -->
      <div class="main-image-container">
        <img
          [src]="currentImage"
          [alt]="altText"
          class="main-image"
          (error)="onImageError($event)"
          (load)="onImageLoad()"
          [class.loading]="imageLoading">

        <div class="image-overlay">
          <button
            mat-icon-button
            color="primary"
            class="zoom-button"
            matTooltip="Zoom"
            (click)="openZoomDialog()">
            <mat-icon>zoom_in</mat-icon>
          </button>
        </div>

        <!-- Navigation arrows for main image -->
        <button
          *ngIf="images.length > 1"
          mat-icon-button
          class="nav-button prev-button"
          matTooltip="Previous"
          [disabled]="currentIndex === 0"
          (click)="previousImage()">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <button
          *ngIf="images.length > 1"
          mat-icon-button
          class="nav-button next-button"
          matTooltip="Next"
          [disabled]="currentIndex === images.length - 1"
          (click)="nextImage()">
          <mat-icon>chevron_right</mat-icon>
        </button>

        <!-- Loading indicator -->
        <div *ngIf="imageLoading" class="loading-indicator">
          <div class="spinner"></div>
        </div>
      </div>

      <!-- Thumbnail Navigation -->
      <div *ngIf="images.length > 1" class="thumbnail-container">
        <div class="thumbnail-list">
          <div
            *ngFor="let image of images; let i = index; trackBy: trackByImage"
            class="thumbnail-wrapper"
            [class.active]="i === currentIndex"
            (click)="selectImage(i)">
            <img
              [src]="image"
              [alt]="altText + ' - Image ' + (i + 1)"
              class="thumbnail"
              (error)="onThumbnailError($event)">
          </div>
        </div>

        <!-- Thumbnail navigation buttons -->
        <button
          mat-icon-button
          class="thumbnail-nav prev"
          [disabled]="thumbnailScrollIndex === 0"
          (click)="scrollThumbnails('prev')">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <button
          mat-icon-button
          class="thumbnail-nav next"
          [disabled]="thumbnailScrollIndex >= maxThumbnailScrollIndex"
          (click)="scrollThumbnails('next')">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <!-- Image Counter -->
      <div *ngIf="images.length > 1" class="image-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  `,
  styles: [`
    .image-gallery {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .main-image-container {
      position: relative;
      background: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 1;
      max-height: 500px;
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
      cursor: zoom-in;
    }

    .main-image.loading {
      opacity: 0.7;
    }

    .image-overlay {
      position: absolute;
      top: 16px;
      right: 16px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .main-image-container:hover .image-overlay {
      opacity: 1;
    }

    .zoom-button {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      z-index: 2;
    }

    .prev-button {
      left: 16px;
    }

    .next-button {
      right: 16px;
    }

    .loading-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .thumbnail-container {
      position: relative;
      max-width: 100%;
    }

    .thumbnail-list {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding: 8px 0;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .thumbnail-list::-webkit-scrollbar {
      display: none;
    }

    .thumbnail-wrapper {
      flex-shrink: 0;
      width: 80px;
      height: 80px;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }

    .thumbnail-wrapper:hover {
      transform: scale(1.05);
    }

    .thumbnail-wrapper.active {
      border-color: #1976d2;
    }

    .thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      z-index: 2;
    }

    .thumbnail-nav.prev {
      left: -20px;
    }

    .thumbnail-nav.next {
      right: -20px;
    }

    .image-counter {
      text-align: center;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .main-image-container {
        max-height: 400px;
      }

      .nav-button {
        display: none;
      }

      .thumbnail-wrapper {
        width: 60px;
        height: 60px;
      }

      .thumbnail-nav {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .main-image-container {
        max-height: 300px;
      }

      .image-overlay {
        top: 8px;
        right: 8px;
      }
    }
  `]
})
export class ImageGalleryComponent implements OnInit {
  @Input() images: string[] = [];
  @Input() altText: string = 'Product image';
  @Input() initialIndex: number = 0;
  @Output() imageChange = new EventEmitter<{index: number, image: string}>();

  currentIndex = 0;
  currentImage = '';
  imageLoading = false;
  thumbnailScrollIndex = 0;
  maxThumbnailScrollIndex = 0;
  thumbnailsPerView = 5;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    if (this.images?.length) {
      this.currentIndex = Math.max(0, Math.min(this.initialIndex, this.images.length - 1));
      this.updateCurrentImage();
      this.calculateThumbnailScrolling();
    }
  }

  selectImage(index: number) {
    if (index >= 0 && index < this.images.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.updateCurrentImage();
      this.emitImageChange();
    }
  }

  previousImage() {
    if (this.currentIndex > 0) {
      this.selectImage(this.currentIndex - 1);
    }
  }

  nextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.selectImage(this.currentIndex + 1);
    }
  }

  updateCurrentImage() {
    this.imageLoading = true;
    this.currentImage = this.images[this.currentIndex] || '/assets/images/product-placeholder.svg';
  }

  private emitImageChange() {
    this.imageChange.emit({
      index: this.currentIndex,
      image: this.currentImage
    });
  }

  onImageLoad() {
    this.imageLoading = false;
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/product-placeholder.svg';
    this.imageLoading = false;
  }

  onThumbnailError(event: any) {
    event.target.src = '/assets/images/product-placeholder.svg';
  }

  openZoomDialog() {
    const dialogRef = this.dialog.open(ImageZoomDialogComponent, {
      data: {
        images: this.images,
        currentIndex: this.currentIndex,
        altText: this.altText
      },
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'image-zoom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.index !== undefined) {
        this.selectImage(result.index);
      }
    });
  }

  scrollThumbnails(direction: 'prev' | 'next') {
    if (direction === 'prev' && this.thumbnailScrollIndex > 0) {
      this.thumbnailScrollIndex--;
    } else if (direction === 'next' && this.thumbnailScrollIndex < this.maxThumbnailScrollIndex) {
      this.thumbnailScrollIndex++;
    }

    const thumbnailList = document.querySelector('.thumbnail-list') as HTMLElement;
    if (thumbnailList) {
      const scrollAmount = 88 * this.thumbnailScrollIndex; // 80px width + 8px gap
      thumbnailList.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  private calculateThumbnailScrolling() {
    this.maxThumbnailScrollIndex = Math.max(0, this.images.length - this.thumbnailsPerView);
  }

  trackByImage(index: number, image: string): string {
    return image;
  }
}

// Zoom Dialog Component
@Component({
  selector: 'app-image-zoom-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="zoom-dialog">
      <div class="zoom-header">
        <span class="image-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="zoom-content">
        <img
          [src]="currentImage"
          [alt]="altText"
          class="zoom-image"
          (error)="onImageError($event)">

        <button
          *ngIf="images.length > 1"
          mat-icon-button
          class="nav-button prev"
          [disabled]="currentIndex === 0"
          (click)="previousImage()">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <button
          *ngIf="images.length > 1"
          mat-icon-button
          class="nav-button next"
          [disabled]="currentIndex === images.length - 1"
          (click)="nextImage()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .zoom-dialog {
      width: 90vw;
      height: 90vh;
      max-width: 1200px;
      max-height: 800px;
      display: flex;
      flex-direction: column;
    }

    .zoom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }

    .zoom-content {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }

    .zoom-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      color: #333;
    }

    .nav-button.prev {
      left: 16px;
    }

    .nav-button.next {
      right: 16px;
    }
  `]
})
export class ImageZoomDialogComponent {
  images: string[] = [];
  currentIndex = 0;
  altText = '';
  currentImage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ImageZoomDialogComponent>
  ) {
    this.images = data.images || [];
    this.currentIndex = data.currentIndex || 0;
    this.altText = data.altText || '';
    this.updateCurrentImage();
  }

  previousImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCurrentImage();
    }
  }

  nextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.updateCurrentImage();
    }
  }

  private updateCurrentImage() {
    this.currentImage = this.images[this.currentIndex] || '/assets/images/product-placeholder.svg';
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/product-placeholder.svg';
  }

  close() {
    this.dialogRef.close({ index: this.currentIndex });
  }
}

// Add required imports for dialog
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';