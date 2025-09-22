import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  companyStats = [
    { label: 'Founded', value: '2024', icon: 'calendar_today' },
    { label: 'Products', value: '10,000+', icon: 'inventory' },
    { label: 'Customers', value: '50,000+', icon: 'people' },
    { label: 'Countries', value: '25+', icon: 'public' }
  ];

  teamMembers = [
    {
      name: 'John Smith',
      role: 'Chief Executive Officer',
      bio: 'Visionary leader with 15 years of e-commerce experience.',
      image: '/assets/images/team/ceo.jpg'
    },
    {
      name: 'Jane Johnson',
      role: 'Chief Technology Officer',
      bio: 'Technology expert driving our digital innovation.',
      image: '/assets/images/team/cto.jpg'
    },
    {
      name: 'Mike Wilson',
      role: 'Head of Product',
      bio: 'Product strategist focused on customer experience.',
      image: '/assets/images/team/product.jpg'
    }
  ];

  values = [
    {
      title: 'Customer First',
      description: 'We prioritize our customers in everything we do.',
      icon: 'favorite'
    },
    {
      title: 'Quality Products',
      description: 'We offer only the highest quality products.',
      icon: 'verified'
    },
    {
      title: 'Innovation',
      description: 'We constantly innovate to improve the shopping experience.',
      icon: 'lightbulb'
    },
    {
      title: 'Sustainability',
      description: 'We are committed to sustainable business practices.',
      icon: 'eco'
    }
  ];
}