import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="warning-icon">warning</mat-icon>
      Delete Workspace
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete <strong>"{{ data.workspaceName }}"</strong>?</p>
      <p class="warning-text">This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" data-testid="cancel-delete-button">
        Cancel
      </button>
      <button mat-raised-button color="warn" (click)="onConfirm()" data-testid="confirm-delete-button">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .warning-icon {
      color: #ff9800;
    }

    .warning-text {
      color: #f44336;
      font-weight: 500;
      margin-top: 0.5rem;
    }

    mat-dialog-content {
      padding: 1rem 0;
    }

    mat-dialog-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `
})
export class ConfirmDeleteDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDeleteDialogComponent>);
  readonly data = inject<{ workspaceName: string }>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
