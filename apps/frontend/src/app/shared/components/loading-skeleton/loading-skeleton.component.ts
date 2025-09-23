import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton"
      [class]="additionalClasses"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="borderRadius"
    ></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .skeleton-text {
      height: 16px;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .skeleton-title {
      height: 24px;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .skeleton-image {
      border-radius: 8px;
    }

    .skeleton-button {
      height: 36px;
      border-radius: 4px;
    }

    .skeleton-card {
      border-radius: 8px;
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() borderRadius: string = '4px';
  @Input() additionalClasses: string = '';
}