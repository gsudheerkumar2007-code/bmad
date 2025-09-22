import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  helpfulLinks = [
    { label: 'Go to Home', route: '/', icon: 'home' },
    { label: 'Browse Products', route: '/products', icon: 'shopping_bag' },
    { label: 'Help Center', route: '/help', icon: 'help' },
    { label: 'Contact Support', route: '/contact', icon: 'support_agent' }
  ];

  onGoBack(): void {
    window.history.back();
  }
}