import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarServiceService {

  constructor(private snackBar: MatSnackBar) { }

  showSuccessSnackbar(message: string) {
    this.snackBar.open(message, "Dismiss", {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  showFailureSnackbar(message: string) {
    this.snackBar.open(message, "Dismiss", {
      panelClass: ['failure-snackbar']
    });
  }
}
