import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './sidebar.component';
import { WorkspaceStore } from '../../workspace/store/workspace.store';
import { signal } from '@angular/core';
import { Workspace } from '../../workspace/models/workspace.model';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockStore: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Create mock store
    mockStore = {
      workspaces: signal<Workspace[]>([]),
      workspacesCount: signal(0),
      loading: signal(false),
      error: signal(null)
    };

    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: WorkspaceStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display home navigation item', () => {
    const compiled = fixture.nativeElement;
    const homeLink = compiled.querySelector('a[routerLink="/"]');

    expect(homeLink).toBeTruthy();
    expect(homeLink.textContent).toContain('Home');
  });

  it('should have tree control initialized', () => {
    expect(component.treeControl).toBeTruthy();
  });

  it('should have data source initialized', () => {
    expect(component.dataSource).toBeTruthy();
  });

  it('should display Workspaces section in tree', () => {
    const compiled = fixture.nativeElement;
    const workspacesSection = compiled.querySelector('[data-testid="workspaces-section"]');

    expect(workspacesSection).toBeTruthy();
  });

  it('should have Workspaces node in data source', () => {
    const workspacesNode = component.dataSource.data.find(node => node.name === 'Workspaces');

    expect(workspacesNode).toBeTruthy();
    expect(workspacesNode?.icon).toBe('folder_special');
    expect(workspacesNode?.route).toBe('/workspace/new');
  });

  it('should navigate to workspace/new when Workspaces section is clicked', () => {
    const workspacesNode = component.dataSource.data.find(node => node.name === 'Workspaces');

    if (workspacesNode) {
      component.navigateToNode(workspacesNode);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/workspace/new']);
    }
  });

  it('should display workspaces from store as children', () => {
    const mockWorkspaces: Workspace[] = [
      {
        id: '1',
        name: 'Workspace 1',
        tags: [],
        description: 'Description 1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Workspace 2',
        tags: [],
        description: 'Description 2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockStore.workspaces.set(mockWorkspaces);
    fixture.detectChanges();

    // Trigger the effect by accessing workspaces
    component.workspaceStore.workspaces();

    const workspacesNode = component.dataSource.data.find(node => node.name === 'Workspaces');

    expect(workspacesNode?.children?.length).toBe(2);
    expect(workspacesNode?.children?.[0].name).toBe('Workspace 1');
    expect(workspacesNode?.children?.[1].name).toBe('Workspace 2');
  });

  it('should expand Workspaces node by default', (done) => {
    setTimeout(() => {
      const workspacesNode = component.dataSource.data.find(node => node.name === 'Workspaces');

      if (workspacesNode) {
        expect(component.treeControl.isExpanded(workspacesNode)).toBeTruthy();
      }
      done();
    }, 100);
  });

  it('should have hasChild predicate that returns true for nodes with children', () => {
    const nodeWithChildren = { name: 'Test', children: [{ name: 'Child' }] };
    const nodeWithoutChildren = { name: 'Test', children: [] };
    const nodeNoChildrenProp = { name: 'Test' };

    expect(component.hasChild(0, nodeWithChildren)).toBeTruthy();
    expect(component.hasChild(0, nodeWithoutChildren)).toBeFalsy();
    expect(component.hasChild(0, nodeNoChildrenProp)).toBeFalsy();
  });

  it('should not navigate when node has no route', () => {
    const nodeWithoutRoute = { name: 'Test' };

    component.navigateToNode(nodeWithoutRoute);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should update tree when workspaces change', () => {
    const initialWorkspacesNode = component.dataSource.data.find(node => node.name === 'Workspaces');
    expect(initialWorkspacesNode?.children?.length).toBe(0);

    const newWorkspace: Workspace = {
      id: '3',
      name: 'New Workspace',
      tags: [],
      description: 'New Description',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockStore.workspaces.set([newWorkspace]);

    // Manually trigger update since we can't easily test effects
    (component as any).updateTreeData();

    const updatedWorkspacesNode = component.dataSource.data.find(node => node.name === 'Workspaces');
    expect(updatedWorkspacesNode?.children?.length).toBe(1);
    expect(updatedWorkspacesNode?.children?.[0].name).toBe('New Workspace');
  });
});
