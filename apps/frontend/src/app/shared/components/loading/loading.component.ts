import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() type: 'spinner' | 'bar' | 'skeleton' = 'spinner';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message: string = 'Loading...';
  @Input() overlay: boolean = false;
  @Input() value?: number; // For progress bar

  get spinnerDiameter(): number {
    switch (this.size) {
      case 'small': return 24;
      case 'medium': return 40;
      case 'large': return 60;
      default: return 40;
    }
  }
}