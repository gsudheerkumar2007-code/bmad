import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;

  contactInfo = [
    {
      title: 'Customer Service',
      description: 'For general inquiries and support',
      icon: 'support_agent',
      details: [
        { label: 'Phone', value: '1-800-SHOP-NOW', icon: 'phone' },
        { label: 'Email', value: 'support@ecommerce.com', icon: 'email' },
        { label: 'Hours', value: 'Mon-Fri: 9AM-6PM EST', icon: 'schedule' }
      ]
    },
    {
      title: 'Business Inquiries',
      description: 'For partnerships and business opportunities',
      icon: 'business',
      details: [
        { label: 'Phone', value: '1-800-BUSINESS', icon: 'phone' },
        { label: 'Email', value: 'business@ecommerce.com', icon: 'email' },
        { label: 'Hours', value: 'Mon-Fri: 9AM-5PM EST', icon: 'schedule' }
      ]
    },
    {
      title: 'Press & Media',
      description: 'For press inquiries and media requests',
      icon: 'article',
      details: [
        { label: 'Email', value: 'press@ecommerce.com', icon: 'email' },
        { label: 'Response', value: 'Within 24 hours', icon: 'schedule' }
      ]
    }
  ];

  inquiryTypes = [
    'General Question',
    'Order Support',
    'Product Inquiry',
    'Technical Issue',
    'Business Partnership',
    'Press Inquiry',
    'Other'
  ];

  constructor(private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      inquiryType: ['', Validators.required],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      // Contact form submission will be implemented in future stories
      console.log('Contact form submitted:', this.contactForm.value);
      alert('Thank you for your message! We will get back to you soon.');
      this.contactForm.reset();
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    return '';
  }
}