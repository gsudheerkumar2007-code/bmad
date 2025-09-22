import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BreadcrumbService, BreadcrumbItem } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  breadcrumbs$: Observable<BreadcrumbItem[]>;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBreadcrumbClick(item: BreadcrumbItem): void {
    if (item.isClickable) {
      // Navigation will be handled by routerLink directive
      // Click tracking can be added here for analytics if needed
    }
  }
}