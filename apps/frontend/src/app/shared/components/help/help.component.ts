import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent {
  faqItems = [
    {
      question: 'How do I create an account?',
      answer: 'Click on the "Sign Up" button in the header and fill out the registration form with your details.'
    },
    {
      question: 'How do I place an order?',
      answer: 'Browse our products, add items to your cart, and proceed to checkout. You will need to be logged in to complete your purchase.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and other secure payment methods. Payment processing will be implemented in future updates.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is placed, you can track it from the "My Orders" section in your account dashboard.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Please contact our customer support for more details.'
    }
  ];

  helpCategories = [
    {
      title: 'Account & Profile',
      icon: 'person',
      items: ['Creating an account', 'Managing your profile', 'Password reset']
    },
    {
      title: 'Shopping & Orders',
      icon: 'shopping_cart',
      items: ['Placing orders', 'Order tracking', 'Cancellations']
    },
    {
      title: 'Payments & Billing',
      icon: 'payment',
      items: ['Payment methods', 'Billing information', 'Refunds']
    },
    {
      title: 'Shipping & Delivery',
      icon: 'local_shipping',
      items: ['Shipping options', 'Delivery tracking', 'International shipping']
    }
  ];

  onContactSupport(): void {
    // Contact support functionality will be implemented in future stories
    console.log('Contact support clicked');
  }
}