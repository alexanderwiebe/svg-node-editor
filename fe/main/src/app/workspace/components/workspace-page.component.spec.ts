import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WorkspacePageComponent } from './workspace-page.component';
import { WorkspaceStore } from '../store/workspace.store';
import { signal } from '@angular/core';

describe('WorkspacePageComponent', () => {
  let component: WorkspacePageComponent;
  let fixture: ComponentFixture<WorkspacePageComponent>;
  let mockStore: any;
  let saveWorkspaceSpy: jasmine.Spy;

  beforeEach(async () => {
    // Create spy for saveWorkspace
    saveWorkspaceSpy = jasmine.createSpy('saveWorkspace');

    // Create mock store
    mockStore = {
      workspaces: signal([]),
      allWorkspaces: signal([]),
      workspacesCount: signal(0),
      loading: signal(false),
      error: signal(null),
      saveWorkspace: saveWorkspaceSpy
    };

    await TestBed.configureTestingModule({
      imports: [
        WorkspacePageComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: WorkspaceStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspacePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with name, tags, and description fields', () => {
    expect(component.workspaceForm.get('name')).toBeTruthy();
    expect(component.workspaceForm.get('tags')).toBeTruthy();
    expect(component.workspaceForm.get('description')).toBeTruthy();
  });

  it('should require name and description fields', () => {
    const nameControl = component.workspaceForm.get('name');
    const descriptionControl = component.workspaceForm.get('description');

    expect(nameControl?.valid).toBeFalsy();
    expect(descriptionControl?.valid).toBeFalsy();

    nameControl?.setValue('Test Workspace');
    descriptionControl?.setValue('Test Description');

    expect(nameControl?.valid).toBeTruthy();
    expect(descriptionControl?.valid).toBeTruthy();
  });

  it('should have save button disabled when form is invalid', () => {
    const compiled = fixture.nativeElement;
    const saveButton = compiled.querySelector('[data-testid="save-workspace-button"]');

    expect(saveButton.disabled).toBeTruthy();
  });

  it('should enable save button when form is valid', () => {
    component.workspaceForm.patchValue({
      name: 'Test Workspace',
      description: 'Test Description'
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const saveButton = compiled.querySelector('[data-testid="save-workspace-button"]');

    expect(saveButton.disabled).toBeFalsy();
  });

  it('should call store.saveWorkspace when save button is clicked with valid form', () => {
    component.workspaceForm.patchValue({
      name: 'Test Workspace',
      tags: 'tag1, tag2, tag3',
      description: 'Test Description'
    });

    component.saveWorkspace();

    expect(saveWorkspaceSpy).toHaveBeenCalledWith({
      name: 'Test Workspace',
      tags: ['tag1', 'tag2', 'tag3'],
      description: 'Test Description'
    });
  });

  it('should parse tags correctly from comma-separated string', () => {
    component.workspaceForm.patchValue({
      name: 'Test',
      tags: 'tag1,  tag2  , tag3',
      description: 'Test'
    });

    component.saveWorkspace();

    expect(saveWorkspaceSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tags: ['tag1', 'tag2', 'tag3']
      })
    );
  });

  it('should handle empty tags field', () => {
    component.workspaceForm.patchValue({
      name: 'Test',
      tags: '',
      description: 'Test'
    });

    component.saveWorkspace();

    expect(saveWorkspaceSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        tags: []
      })
    );
  });

  it('should reset form after saving', () => {
    component.workspaceForm.patchValue({
      name: 'Test Workspace',
      tags: 'tag1',
      description: 'Test Description'
    });

    component.saveWorkspace();

    expect(component.workspaceForm.get('name')?.value).toBeNull();
    expect(component.workspaceForm.get('tags')?.value).toBeNull();
    expect(component.workspaceForm.get('description')?.value).toBeNull();
  });

  it('should display error message when store has error', () => {
    mockStore.error.set('Failed to save workspace');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorMessage = compiled.querySelector('[data-testid="error-message"]');

    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('Failed to save workspace');
  });

  it('should not call saveWorkspace when form is invalid', () => {
    component.workspaceForm.patchValue({
      name: '',
      description: ''
    });

    component.saveWorkspace();

    expect(saveWorkspaceSpy).not.toHaveBeenCalled();
  });
});
