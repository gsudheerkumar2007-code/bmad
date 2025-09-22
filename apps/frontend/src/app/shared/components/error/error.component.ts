import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  errorMessage = 'Something went wrong';
  errorCode = '500';
  errorDetails = 'We encountered an unexpected error while processing your request.';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get error details from query parameters if available
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.errorMessage = params['message'];
      }
      if (params['code']) {
        this.errorCode = params['code'];
      }
      if (params['details']) {
        this.errorDetails = params['details'];
      }
    });
  }

  onRetry(): void {
    window.location.reload();
  }

  onGoBack(): void {
    window.history.back();
  }

  onReportError(): void {
    // TODO: Implement error reporting functionality
    console.log('Error reported:', {
      code: this.errorCode,
      message: this.errorMessage,
      details: this.errorDetails,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentTime(): string {
    return new Date().toLocaleString();
  }
}