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
import { TagInputComponent } from './tag-input.component';
import { selectAllTags } from '../store/workspace.selectors';

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
    MatDialogModule,
    TagInputComponent
  ],
  template: `
    <div class="workspace-container">
      <div class="workspace-header">
        <div class="header-content">
          @if (isEditMode()) {
            <!-- Title -->
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

            <!-- Tags -->
            <div class="header-section">
              @if (isEditingTags()) {
                <div class="tags-edit-container">
                  <mat-chip-grid #chipGrid>
                    @for (tag of workspaceTags(); track tag) {
                      <mat-chip-row
                        (removed)="removeTag(tag)"
                        [editable]="false"
                        data-testid="tag-chip">
                        {{ tag }}
                        <button matChipRemove>
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </mat-chip-row>
                    }
                  </mat-chip-grid>
                  <input
                    class="tag-input-field"
                    placeholder="Add tag and press Enter..."
                    [(ngModel)]="newTag"
                    (keyup.enter)="addTag()"
                    (blur)="saveTagsEdit()"
                    (keyup.escape)="cancelTagsEdit()"
                    #tagInputField
                    data-testid="tag-input-field">
                </div>
              } @else {
                <div class="editable-section tags-display" (click)="startTagsEdit()" data-testid="workspace-tags">
                  @if (workspaceTags().length > 0) {
                    @for (tag of workspaceTags(); track tag) {
                      <span class="tag-chip">{{ tag }}</span>
                    }
                  } @else {
                    <span class="placeholder">No tags (click to add)</span>
                  }
                  <mat-icon class="edit-hint">edit</mat-icon>
                </div>
              }
            </div>

            <!-- Description -->
            <div class="header-section">
              @if (isEditingDescription()) {
                <textarea
                  class="description-input"
                  [(ngModel)]="editedDescription"
                  (blur)="saveDescriptionEdit()"
                  (keyup.escape)="cancelDescriptionEdit()"
                  #descriptionInput
                  rows="3"
                  data-testid="workspace-description-input">
                </textarea>
              } @else {
                <div class="editable-section description-display" (click)="startDescriptionEdit()" data-testid="workspace-description">
                  @if (currentWorkspaceDescription()) {
                    <p>{{ currentWorkspaceDescription() }}</p>
                  } @else {
                    <p class="placeholder">No description (click to add)</p>
                  }
                  <mat-icon class="edit-hint">edit</mat-icon>
                </div>
              }
            </div>
          } @else {
            <h1>New Workspace</h1>
          }
        </div>
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
          } @else {
            <button
              mat-raised-button
              color="primary"
              (click)="saveWorkspace()"
              [disabled]="!workspaceForm.valid || store.loading()"
              data-testid="save-workspace-button">
              <mat-icon>save</mat-icon>
              Save Workspace
            </button>
          }
        </div>
      </div>

      <!-- Form only shown for new workspace -->
      @if (!isEditMode()) {
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

              <app-tag-input
                [value]="workspaceTags()"
                [existingTags]="existingTags()"
                (valueChange)="onTagsChange($event)"
                data-testid="workspace-tags-input">
              </app-tag-input>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  placeholder="Enter workspace description"
                  rows="4"
                  data-testid="workspace-description-input-form">
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
      }

      @if (store.error() && isEditMode()) {
        <div class="error-message" data-testid="error-message">
          {{ store.error() }}
        </div>
      }
    </div>
  `,
  styles: `
    .workspace-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .header-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
      margin: 0;
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
      width: 100%;
      max-width: 600px;
    }

    .header-section {
      display: flex;
      flex-direction: column;
    }

    .editable-section {
      cursor: pointer;
      padding: 0.75rem;
      border-radius: 4px;
      border: 2px solid transparent;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 40px;
    }

    .editable-section:hover {
      background-color: #f5f5f5;
      border-color: #e0e0e0;
    }

    .editable-section .edit-hint {
      font-size: 1rem;
      opacity: 0;
      transition: opacity 0.2s;
      margin-left: auto;
    }

    .editable-section:hover .edit-hint {
      opacity: 0.6;
    }

    .tags-display {
      flex-wrap: wrap;
    }

    .tag-chip {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background-color: #e0e0e0;
      border-radius: 16px;
      font-size: 0.875rem;
      margin-right: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .placeholder {
      color: #999;
      font-style: italic;
    }

    .description-display p {
      margin: 0;
      line-height: 1.5;
    }

    .tags-edit-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 2px solid #1976d2;
      border-radius: 4px;
      background-color: white;
    }

    .tag-input-field {
      border: none;
      outline: none;
      padding: 0.5rem;
      font-family: inherit;
      font-size: 0.875rem;
    }

    .description-input {
      width: 100%;
      border: 2px solid #1976d2;
      padding: 0.75rem;
      border-radius: 4px;
      font-family: inherit;
      font-size: 1rem;
      outline: none;
      resize: vertical;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      flex-shrink: 0;
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
  @ViewChild('tagInputField') tagInputField?: ElementRef<HTMLInputElement>;
  @ViewChild('descriptionInput') descriptionInputRef?: ElementRef<HTMLTextAreaElement>;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  workspaceId = computed(() => this.route.snapshot.paramMap.get('id'));
  isEditMode = computed(() => !!this.workspaceId());

  // Title editing
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

  // Tags editing
  isEditingTags = signal(false);
  newTag = '';
  workspaceTags = signal<string[]>([]);
  existingTags = selectAllTags(this.store.workspaces);

  // Description editing
  isEditingDescription = signal(false);
  editedDescription = '';
  currentWorkspaceDescription = computed(() => {
    const id = this.workspaceId();
    if (id) {
      const workspace = this.store.getWorkspaceById(id);
      return workspace?.description || '';
    }
    return '';
  });

  workspaceForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
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
          description: workspace.description
        });
        this.workspaceTags.set(workspace.tags);
      } else {
        // Workspace not found, redirect to new workspace
        this.router.navigate(['/workspace/new']);
      }
    }
  }

  onTagsChange(tags: string[]) {
    this.workspaceTags.set(tags);
  }

  async saveWorkspace() {
    if (this.workspaceForm.valid) {
      const formValue = this.workspaceForm.value;

      const data = {
        name: formValue.name,
        tags: this.workspaceTags(),
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

  // Tags editing methods
  startTagsEdit() {
    this.isEditingTags.set(true);
    setTimeout(() => {
      this.tagInputField?.nativeElement.focus();
    }, 0);
  }

  addTag() {
    const tag = this.newTag.trim();
    if (tag && !this.workspaceTags().includes(tag)) {
      this.workspaceTags.update(tags => [...tags, tag]);
      this.newTag = '';

      // Auto-save tags
      this.saveTagsToWorkspace();
    }
  }

  removeTag(tag: string) {
    this.workspaceTags.update(tags => tags.filter(t => t !== tag));

    // Auto-save tags
    this.saveTagsToWorkspace();
  }

  saveTagsEdit() {
    // Add any pending tag
    if (this.newTag.trim()) {
      this.addTag();
    }
    this.isEditingTags.set(false);
  }

  cancelTagsEdit() {
    const id = this.workspaceId();
    if (id) {
      const workspace = this.store.getWorkspaceById(id);
      if (workspace) {
        this.workspaceTags.set(workspace.tags);
      }
    }
    this.newTag = '';
    this.isEditingTags.set(false);
  }

  private saveTagsToWorkspace() {
    const id = this.workspaceId();
    if (!id) return;

    const workspace = this.store.getWorkspaceById(id);
    if (workspace) {
      this.store.updateWorkspace(id, {
        name: workspace.name,
        tags: this.workspaceTags(),
        description: workspace.description
      });
    }
  }

  // Description editing methods
  startDescriptionEdit() {
    this.editedDescription = this.currentWorkspaceDescription();
    this.isEditingDescription.set(true);

    setTimeout(() => {
      this.descriptionInputRef?.nativeElement.focus();
      this.descriptionInputRef?.nativeElement.select();
    }, 0);
  }

  saveDescriptionEdit() {
    const id = this.workspaceId();
    if (!id) {
      this.cancelDescriptionEdit();
      return;
    }

    const workspace = this.store.getWorkspaceById(id);
    if (workspace) {
      this.store.updateWorkspace(id, {
        name: workspace.name,
        tags: workspace.tags,
        description: this.editedDescription.trim()
      });
    }

    this.isEditingDescription.set(false);
  }

  cancelDescriptionEdit() {
    this.isEditingDescription.set(false);
    this.editedDescription = '';
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
