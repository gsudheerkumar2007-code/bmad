import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { BreadcrumbComponent } from './shared/components/breadcrumb/breadcrumb.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    BreadcrumbComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'E-Commerce Platform';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize theme service - this will set up the theme based on saved preferences
    // The theme service constructor handles the initialization automatically
  }
}
