import { TestBed } from '@angular/core/testing';
import { WorkspaceStore } from './workspace.store';

describe('WorkspaceStore', () => {
  let store: InstanceType<typeof WorkspaceStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkspaceStore]
    });
    store = TestBed.inject(WorkspaceStore);
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty workspaces array', () => {
    expect(store.workspaces()).toEqual([]);
    expect(store.workspacesCount()).toBe(0);
  });

  it('should initialize with loading false', () => {
    expect(store.loading()).toBe(false);
  });

  it('should initialize with no error', () => {
    expect(store.error()).toBeNull();
  });

  it('should have saveWorkspace method', () => {
    expect(store.saveWorkspace).toBeDefined();
    expect(typeof store.saveWorkspace).toBe('function');
  });

  it('should have allWorkspaces computed signal', () => {
    expect(store.allWorkspaces).toBeDefined();
    expect(store.allWorkspaces()).toEqual([]);
  });

  it('should have workspacesCount computed signal', () => {
    expect(store.workspacesCount).toBeDefined();
    expect(store.workspacesCount()).toBe(0);
  });
});
