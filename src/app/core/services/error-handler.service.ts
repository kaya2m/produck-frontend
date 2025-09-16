import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private snackBar = inject(MatSnackBar);

  handleError(error: any, context: string = 'Operation'): void {
    console.error(`${context} error:`, error);

    let message = 'An unexpected error occurred';
    let duration = 5000;

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          message = 'Invalid request. Please check your input.';
          break;
        case 401:
          message = 'Authentication required. Please log in.';
          duration = 3000;
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 409:
          message = 'This operation conflicts with existing data.';
          break;
        case 422:
          message = error.error?.message || 'Validation failed. Please check your input.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 503:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          if (error.error?.message) {
            message = error.error.message;
          } else if (error.message) {
            message = error.message;
          }
      }
    } else if (error?.message) {
      message = error.message;
    }

    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['error-snackbar']
    });
  }

  handleSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['success-snackbar']
    });
  }

  handleWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['warning-snackbar']
    });
  }

  handleInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['info-snackbar']
    });
  }
}