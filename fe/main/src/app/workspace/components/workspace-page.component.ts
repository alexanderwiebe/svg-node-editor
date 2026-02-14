import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { WorkspaceStore } from '../store/workspace.store';

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="workspace-container">
      <div class="workspace-header">
        <h1>New Workspace</h1>
        <button
          mat-raised-button
          color="primary"
          (click)="saveWorkspace()"
          [disabled]="!workspaceForm.valid || store.loading()"
          data-testid="save-workspace-button">
          <mat-icon>save</mat-icon>
          Save Workspace
        </button>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="workspaceForm" class="workspace-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input
                matInput
                formControlName="name"
                placeholder="Enter workspace name"
                data-testid="workspace-name-input">
              @if (workspaceForm.get('name')?.hasError('required') && workspaceForm.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tags (comma-separated)</mat-label>
              <input
                matInput
                formControlName="tags"
                placeholder="e.g., project, team, design"
                data-testid="workspace-tags-input">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                formControlName="description"
                placeholder="Enter workspace description"
                rows="4"
                data-testid="workspace-description-input">
              </textarea>
              @if (workspaceForm.get('description')?.hasError('required') && workspaceForm.get('description')?.touched) {
                <mat-error>Description is required</mat-error>
              }
            </mat-form-field>
          </form>

          @if (store.error()) {
            <div class="error-message" data-testid="error-message">
              {{ store.error() }}
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .workspace-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .workspace-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
    }

    .workspace-header button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-card {
      margin-top: 1rem;
    }

    .workspace-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      color: #f44336;
      margin-top: 1rem;
      padding: 1rem;
      background-color: #ffebee;
      border-radius: 4px;
    }
  `
})
export class WorkspacePageComponent {
  private fb = inject(FormBuilder);
  readonly store = inject(WorkspaceStore);

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  workspaceForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    tags: [''],
    description: ['', Validators.required]
  });

  saveWorkspace() {
    if (this.workspaceForm.valid) {
      const formValue = this.workspaceForm.value;
      const tags = formValue.tags
        ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];

      this.store.saveWorkspace({
        name: formValue.name,
        tags,
        description: formValue.description
      });

      // Reset form after saving
      this.workspaceForm.reset();
    }
  }
}
