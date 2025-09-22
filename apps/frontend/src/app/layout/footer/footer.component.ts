import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com' }
  ];

  quickLinks = [
    { label: 'Home', route: '/' },
    { label: 'Products', route: '/products' },
    { label: 'About Us', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ];

  customerServiceLinks = [
    { label: 'Help Center', route: '/help' },
    { label: 'Returns', route: '/returns' },
    { label: 'Shipping Info', route: '/shipping' },
    { label: 'Track Order', route: '/track-order' }
  ];

  legalLinks = [
    { label: 'Privacy Policy', route: '/privacy' },
    { label: 'Terms of Service', route: '/terms' },
    { label: 'Cookie Policy', route: '/cookies' },
    { label: 'Accessibility', route: '/accessibility' }
  ];

  onSocialLinkClick(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}