import { Component, inject, OnInit, computed, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { WorkspaceStore } from '../store/workspace.store';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule
  ],
  template: `
    <div class="workspace-container">
      <div class="workspace-header">
        @if (isEditMode()) {
          @if (isEditingTitle()) {
            <input
              class="title-input"
              [(ngModel)]="editedTitle"
              (blur)="saveTitleEdit()"
              (keyup.enter)="saveTitleEdit()"
              (keyup.escape)="cancelTitleEdit()"
              #titleInput
              data-testid="workspace-title-input">
          } @else {
            <h1 class="editable-title" (click)="startTitleEdit()" data-testid="workspace-title">
              {{ currentWorkspaceName() }}
              <mat-icon class="edit-hint">edit</mat-icon>
            </h1>
          }
        } @else {
          <h1>New Workspace</h1>
        }
        <div class="header-actions">
          @if (isEditMode()) {
            <button
              mat-raised-button
              color="warn"
              (click)="deleteWorkspace()"
              [disabled]="store.loading()"
              data-testid="delete-workspace-button">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          }
          <button
            mat-raised-button
            color="primary"
            (click)="saveWorkspace()"
            [disabled]="!workspaceForm.valid || store.loading()"
            data-testid="save-workspace-button">
            <mat-icon>{{ isEditMode() ? 'edit' : 'save' }}</mat-icon>
            {{ isEditMode() ? 'Update Workspace' : 'Save Workspace' }}
          </button>
        </div>
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

    .editable-title {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: color 0.2s;
    }

    .editable-title:hover {
      color: #1976d2;
    }

    .editable-title .edit-hint {
      font-size: 1.2rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .editable-title:hover .edit-hint {
      opacity: 0.6;
    }

    .title-input {
      font-size: 2rem;
      font-weight: 400;
      border: 2px solid #1976d2;
      padding: 0.5rem;
      border-radius: 4px;
      font-family: inherit;
      outline: none;
      min-width: 300px;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .header-actions button {
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
export class WorkspacePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  readonly store = inject(WorkspaceStore);

  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  workspaceId = computed(() => this.route.snapshot.paramMap.get('id'));
  isEditMode = computed(() => !!this.workspaceId());

  isEditingTitle = signal(false);
  editedTitle = '';
  currentWorkspaceName = computed(() => {
    const id = this.workspaceId();
    if (id) {
      const workspace = this.store.getWorkspaceById(id);
      return workspace?.name || 'Edit Workspace';
    }
    return 'New Workspace';
  });

  workspaceForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    tags: [''],
    description: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.workspaceId();
    if (id) {
      // Load existing workspace data
      const workspace = this.store.getWorkspaceById(id);
      if (workspace) {
        this.workspaceForm.patchValue({
          name: workspace.name,
          tags: workspace.tags.join(', '),
          description: workspace.description
        });
      } else {
        // Workspace not found, redirect to new workspace
        this.router.navigate(['/workspace/new']);
      }
    }
  }

  async saveWorkspace() {
    if (this.workspaceForm.valid) {
      const formValue = this.workspaceForm.value;
      const tags = formValue.tags
        ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];

      const data = {
        name: formValue.name,
        tags,
        description: formValue.description
      };

      const id = this.workspaceId();
      if (id) {
        // Update existing workspace
        this.store.updateWorkspace(id, data);

        // Navigate back to home after update
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 600);
      } else {
        // Create new workspace and navigate to it
        const workspace = await this.store.saveWorkspace(data);

        // Navigate to the new workspace's edit page
        setTimeout(() => {
          this.router.navigate(['/workspace', workspace.id]);
        }, 600);
      }
    }
  }

  startTitleEdit() {
    this.editedTitle = this.currentWorkspaceName();
    this.isEditingTitle.set(true);

    // Focus the input after it renders
    setTimeout(() => {
      this.titleInput?.nativeElement.focus();
      this.titleInput?.nativeElement.select();
    }, 0);
  }

  saveTitleEdit() {
    const id = this.workspaceId();
    if (!id || !this.editedTitle.trim()) {
      this.cancelTitleEdit();
      return;
    }

    // Update the workspace name
    const workspace = this.store.getWorkspaceById(id);
    if (workspace) {
      this.store.updateWorkspace(id, {
        name: this.editedTitle.trim(),
        tags: workspace.tags,
        description: workspace.description
      });

      // Also update the form
      this.workspaceForm.patchValue({
        name: this.editedTitle.trim()
      });
    }

    this.isEditingTitle.set(false);
  }

  cancelTitleEdit() {
    this.isEditingTitle.set(false);
    this.editedTitle = '';
  }

  deleteWorkspace() {
    const id = this.workspaceId();
    if (!id) return;

    const workspace = this.store.getWorkspaceById(id);
    if (!workspace) return;

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { workspaceName: workspace.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.store.deleteWorkspace(id);

        // Navigate to home after deletion
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 400);
      }
    });
  }
}
