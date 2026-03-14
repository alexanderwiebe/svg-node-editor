import { Component, inject, computed, signal, effect, ViewChild, ElementRef, DestroyRef } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Subject, debounceTime } from 'rxjs';
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
import type { DiagramData } from '../models/workspace.model';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { TagInputComponent } from './tag-input.component';
import { selectAllTags } from '../store/workspace.selectors';
import { DiagramEditorComponent } from '../../editor/components/diagram-editor.component';

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
    TagInputComponent,
    DiagramEditorComponent
  ],
  template: `
    @if (isEditMode()) {
      <div class="title-bar">
        <div class="title-bar-left" (click)="toggleMetadata()">
          <span class="chevron">{{ metadataExpanded() ? '▼' : '▸' }}</span>
          @if (isEditingTitle()) {
            <input
              class="title-input"
              [(ngModel)]="editedTitle"
              (blur)="saveTitleEdit()"
              (keyup.enter)="saveTitleEdit()"
              (keyup.escape)="cancelTitleEdit()"
              (click)="$event.stopPropagation()"
              #titleInput
              data-testid="workspace-title-input">
          } @else {
            <h1 class="title" (dblclick)="startTitleEdit(); $event.stopPropagation()" data-testid="workspace-title">
              {{ currentWorkspaceName() }}
            </h1>
          }
        </div>
        <div class="title-bar-actions">
          <button
            mat-icon-button
            color="warn"
            (click)="deleteWorkspace()"
            [disabled]="store.loading()"
            data-testid="delete-workspace-button">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>

      <div class="metadata-pane" [class.expanded]="metadataExpanded()">
        <div class="metadata-content">
          <!-- Tags -->
          <div class="meta-section">
            @if (isEditingTags()) {
              <div class="tags-edit-container">
                <mat-chip-grid #chipGrid>
                  @for (tag of workspaceTags(); track tag) {
                    <mat-chip-row
                      (removed)="removeTag(tag)"
                      [editable]="false"
                      data-testid="tag-chip">
                      {{ tag }}
                      <button matChipRemove (click)="removeTag(tag); $event.stopPropagation()" (mousedown)="$event.preventDefault()">
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
          <div class="meta-section">
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
        </div>
      </div>

      @if (store.error()) {
        <div class="error-message" data-testid="error-message">
          {{ store.error() }}
        </div>
      }

      <div class="canvas-area">
        @for (id of [workspaceId()]; track id) {
          <app-diagram-editor
            [initialDiagram]="currentDiagram()"
            (diagramChanged)="onDiagramChanged($event)" />
        }
      </div>
    } @else {
      <!-- New workspace form -->
      <div class="new-workspace-container">
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
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .title-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }

    .title-bar-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      flex: 1;
      min-width: 0;
    }

    .chevron {
      font-size: 0.875rem;
      color: #666;
      flex-shrink: 0;
    }

    .title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .title-input {
      font-size: 1.25rem;
      font-weight: 500;
      border: 2px solid #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: inherit;
      outline: none;
      flex: 1;
      min-width: 0;
    }

    .title-bar-actions {
      flex-shrink: 0;
    }

    .metadata-pane {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      border-bottom: 1px solid transparent;
      flex-shrink: 0;
    }

    .metadata-pane.expanded {
      max-height: 300px;
      border-bottom-color: #e0e0e0;
    }

    .metadata-content {
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meta-section {
      display: flex;
      flex-direction: column;
    }

    .editable-section {
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid transparent;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 36px;
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
      padding: 0.2rem 0.6rem;
      background-color: #e0e0e0;
      border-radius: 16px;
      font-size: 0.8rem;
    }

    .placeholder {
      color: #999;
      font-style: italic;
    }

    .description-display p {
      margin: 0;
      line-height: 1.4;
    }

    .tags-edit-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 2px solid #1976d2;
      border-radius: 4px;
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
      padding: 0.5rem;
      border-radius: 4px;
      font-family: inherit;
      font-size: 0.9rem;
      outline: none;
      resize: vertical;
      box-sizing: border-box;
    }

    .canvas-area {
      flex: 1;
      min-height: 0;
      display: flex;
    }

    .canvas-area app-diagram-editor {
      flex: 1;
      width: 100%;
      height: 100%;
    }

    .error-message {
      color: #f44336;
      padding: 0.5rem 1rem;
      background-color: #ffebee;
      flex-shrink: 0;
    }

    /* New workspace form styles */
    .new-workspace-container {
      padding: 2rem;
      max-width: 1000px;
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
  `
})
export class WorkspacePageComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  readonly store = inject(WorkspaceStore);

  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('tagInputField') tagInputField?: ElementRef<HTMLInputElement>;
  @ViewChild('descriptionInput') descriptionInputRef?: ElementRef<HTMLTextAreaElement>;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  workspaceId = toSignal(this.route.paramMap.pipe(map(p => p.get('id'))), { initialValue: null });
  isEditMode = computed(() => !!this.workspaceId());

  // Metadata pane toggle
  metadataExpanded = signal(false);

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

  // Diagram
  currentDiagram = computed(() => {
    const id = this.workspaceId();
    if (!id) return { nodes: [], edges: [] } as DiagramData;
    return this.store.getWorkspaceById(id)?.diagram ?? { nodes: [], edges: [] };
  });
  private diagramSave$ = new Subject<DiagramData>();

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

  constructor() {
    effect(() => {
      const id = this.workspaceId();
      if (id) {
        const workspace = this.store.getWorkspaceById(id);
        if (workspace) {
          this.workspaceForm.patchValue({
            name: workspace.name,
            description: workspace.description
          });
          this.workspaceTags.set(workspace.tags);
        } else {
          this.router.navigate(['/workspace/new']);
        }
      }
    });

    this.diagramSave$.pipe(
      debounceTime(500),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(diagram => {
      const id = this.workspaceId();
      console.log('[WorkspacePage] debounce fired, saving diagram for workspace=', id, 'nodes=', diagram.nodes.length);
      if (id) {
        this.store.saveDiagram(id, diagram);
      }
    });
  }

  onDiagramChanged(diagram: DiagramData) {
    console.log('[WorkspacePage] onDiagramChanged received, nodes=', diagram.nodes.length, 'edges=', diagram.edges.length);
    this.diagramSave$.next(diagram);
  }

  toggleMetadata() {
    this.metadataExpanded.update(v => !v);
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
