import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home.component';
import { HomeStore } from '../store/home.store';
import { signal } from '@angular/core';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockStore: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Create mock store
    mockStore = {
      hasMessage: signal(false),
      displayMessage: signal(''),
      loading: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: HomeStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display getting started card', () => {
    const compiled = fixture.nativeElement;
    const gettingStartedCard = compiled.querySelector('.getting-started-card');

    expect(gettingStartedCard).toBeTruthy();
  });

  it('should have create new workspace button', () => {
    const compiled = fixture.nativeElement;
    const createButton = compiled.querySelector('[data-testid="create-workspace-button"]');

    expect(createButton).toBeTruthy();
    expect(createButton.textContent).toContain('Create New Workspace');
  });

  it('should navigate to workspace/new when create button is clicked', () => {
    const compiled = fixture.nativeElement;
    const createButton = compiled.querySelector('[data-testid="create-workspace-button"]');

    createButton.click();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/workspace/new']);
  });

  it('should call createNewWorkspace method when button is clicked', () => {
    spyOn(component, 'createNewWorkspace');

    const compiled = fixture.nativeElement;
    const createButton = compiled.querySelector('[data-testid="create-workspace-button"]');
    createButton.click();

    expect(component.createNewWorkspace).toHaveBeenCalled();
  });

  it('should display the getting started message', () => {
    const compiled = fixture.nativeElement;
    const cardContent = compiled.querySelector('.getting-started-card mat-card-content');

    expect(cardContent.textContent).toContain('Workspaces help you organize your documents and projects');
  });

  it('should have both getting started and welcome cards', () => {
    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('mat-card');

    expect(cards.length).toBe(2);
  });

  it('should display API test button', () => {
    const compiled = fixture.nativeElement;
    const testApiButton = compiled.querySelector('button[color="primary"]');

    expect(testApiButton).toBeTruthy();
  });
});
