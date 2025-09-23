import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { LoadingSkeletonComponent } from './loading-skeleton.component';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [CommonModule, MatCardModule, LoadingSkeletonComponent],
  template: `
    <mat-card class="product-card-skeleton">
      <div class="skeleton-image-container">
        <app-loading-skeleton
          width="100%"
          height="200px"
          additionalClasses="skeleton-image">
        </app-loading-skeleton>
      </div>

      <mat-card-content class="skeleton-content">
        <app-loading-skeleton
          width="100%"
          height="24px"
          additionalClasses="skeleton-title">
        </app-loading-skeleton>

        <app-loading-skeleton
          width="80%"
          height="16px"
          additionalClasses="skeleton-text">
        </app-loading-skeleton>

        <app-loading-skeleton
          width="60%"
          height="16px"
          additionalClasses="skeleton-text">
        </app-loading-skeleton>

        <div class="skeleton-footer">
          <app-loading-skeleton
            width="80px"
            height="20px"
            additionalClasses="skeleton-text">
          </app-loading-skeleton>

          <app-loading-skeleton
            width="100px"
            height="36px"
            additionalClasses="skeleton-button">
          </app-loading-skeleton>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .product-card-skeleton {
      margin-bottom: 16px;
      height: 350px;
    }

    .skeleton-image-container {
      position: relative;
      width: 100%;
      height: 200px;
      margin-bottom: 16px;
    }

    .skeleton-content {
      padding: 16px;
    }

    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
    }
  `]
})
export class ProductCardSkeletonComponent {}