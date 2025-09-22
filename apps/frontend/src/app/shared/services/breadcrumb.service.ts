import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
  isClickable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$: Observable<BreadcrumbItem[]> = this.breadcrumbsSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged()
      )
      .subscribe(() => {
        const breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbsSubject.next(breadcrumbs);
      });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    // Add home breadcrumb if this is the first call
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({
        label: 'Home',
        url: '/',
        isClickable: true
      });
    }

    // Get route data for breadcrumb configuration
    const routeData = route.snapshot.data;
    const routeUrl = route.snapshot.url.map(segment => segment.path).join('/');

    if (routeUrl) {
      url += `/${routeUrl}`;
    }

    // Add breadcrumb item if route has breadcrumb data
    if (routeData && routeData['breadcrumb']) {
      const breadcrumbData = routeData['breadcrumb'];

      // Handle dynamic breadcrumb labels
      let label = breadcrumbData.label || breadcrumbData;
      if (typeof label === 'function') {
        label = label(route.snapshot);
      }

      breadcrumbs.push({
        label: label,
        url: url,
        isClickable: breadcrumbData.isClickable !== false
      });
    } else if (routeUrl) {
      // Generate default breadcrumb from URL segment
      const label = this.generateLabelFromUrl(routeUrl);
      if (label && label !== 'Home') {
        breadcrumbs.push({
          label: label,
          url: url,
          isClickable: true
        });
      }
    }

    // Recursively build breadcrumbs for child routes
    if (route.firstChild) {
      return this.buildBreadcrumbs(route.firstChild, url, breadcrumbs);
    }

    // Mark the last breadcrumb as non-clickable (current page)
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isClickable = false;
    }

    return breadcrumbs;
  }

  private generateLabelFromUrl(urlSegment: string): string {
    // Convert URL segment to readable label
    return urlSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Method to manually set breadcrumbs for complex scenarios
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  // Method to add a single breadcrumb item
  addBreadcrumb(item: BreadcrumbItem): void {
    const currentBreadcrumbs = this.breadcrumbsSubject.value;
    this.breadcrumbsSubject.next([...currentBreadcrumbs, item]);
  }

  // Method to clear all breadcrumbs
  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }
}