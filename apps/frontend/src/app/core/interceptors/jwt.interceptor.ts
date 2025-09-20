import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add JWT token to request headers
    const token = this.authService.getAccessToken();

    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 unauthorized errors
        if (error.status === 401 && token) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Try to refresh the token
    return this.authService.refreshTokens().pipe(
      switchMap(() => {
        // Retry the original request with new token
        const newToken = this.authService.getAccessToken();
        if (newToken) {
          const newRequest = this.addTokenToRequest(request, newToken);
          return next.handle(newRequest);
        }

        // If no token after refresh, logout
        this.authService.logout();
        return throwError(() => new Error('Authentication failed'));
      }),
      catchError((refreshError) => {
        // Refresh failed, logout user
        this.authService.logout();
        return throwError(() => refreshError);
      })
    );
  }
}