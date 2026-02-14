import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { WorkspaceStore } from '../../workspace/store/workspace.store';
import { selectAllTags, selectTagsWithCount } from '../../workspace/store/workspace.selectors';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatListModule,
    MatButtonModule,
    MatBadgeModule
  ],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h1>Search Workspaces</h1>
      </div>

      <div class="search-content">
        <div class="search-filters">
          <mat-card class="search-card">
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Search by name</mat-label>
                <input
                  matInput
                  [formControl]="searchControl"
                  placeholder="Enter workspace name..."
                  data-testid="search-name-input">
                <mat-icon matPrefix>search</mat-icon>
                @if (searchControl.value) {
                  <button matSuffix mat-icon-button (click)="clearNameSearch()" data-testid="clear-name-search">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </mat-form-field>

              <div class="tags-section">
                <div class="section-header">
                  <h3>Filter by Tags</h3>
                  @if (selectedTags().length > 0) {
                    <button mat-button color="primary" (click)="clearTagFilters()" data-testid="clear-tag-filters">
                      Clear Tags
                    </button>
                  }
                </div>

                @if (selectedTags().length > 0) {
                  <div class="selected-tags">
                    <mat-chip-set>
                      @for (tag of selectedTags(); track tag) {
                        <mat-chip (removed)="removeTagFilter(tag)" data-testid="selected-tag-chip">
                          {{ tag }}
                          <button matChipRemove>
                            <mat-icon>cancel</mat-icon>
                          </button>
                        </mat-chip>
                      }
                    </mat-chip-set>
                  </div>
                }

                <div class="available-tags">
                  <h4>Available Tags</h4>
                  @if (availableTags().length === 0) {
                    <p class="no-tags">No tags available</p>
                  } @else {
                    <mat-chip-set>
                      @for (tagWithCount of availableTags(); track tagWithCount.tag) {
                        <mat-chip
                          (click)="addTagFilter(tagWithCount.tag)"
                          [disabled]="selectedTags().includes(tagWithCount.tag)"
                          class="clickable-chip"
                          data-testid="available-tag-chip">
                          {{ tagWithCount.tag }}
                          <span matBadge="{{ tagWithCount.count }}" matBadgeSize="small" class="tag-badge"></span>
                        </mat-chip>
                      }
                    </mat-chip-set>
                  }
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="search-results">
          <mat-card class="results-card">
            <mat-card-header>
              <mat-card-title>
                Results
                @if (filteredWorkspaces().length > 0) {
                  <span class="result-count">({{ filteredWorkspaces().length }})</span>
                }
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (filteredWorkspaces().length === 0) {
                <div class="no-results" data-testid="no-results">
                  <mat-icon>search_off</mat-icon>
                  <p>No workspaces found</p>
                  @if (searchControl.value || selectedTags().length > 0) {
                    <p class="hint">Try adjusting your search criteria</p>
                  }
                </div>
              } @else {
                <mat-list>
                  @for (workspace of filteredWorkspaces(); track workspace.id) {
                    <mat-list-item
                      (click)="navigateToWorkspace(workspace.id)"
                      class="workspace-result"
                      data-testid="search-result-item">
                      <mat-icon matListItemIcon>work</mat-icon>
                      <div matListItemTitle>{{ workspace.name }}</div>
                      <div matListItemLine class="workspace-meta">
                        @if (workspace.tags.length > 0) {
                          <span class="tags-preview">
                            <mat-icon class="small-icon">local_offer</mat-icon>
                            {{ workspace.tags.join(', ') }}
                          </span>
                        }
                      </div>
                      <div matListItemLine class="workspace-description">
                        {{ workspace.description }}
                      </div>
                    </mat-list-item>
                  }
                </mat-list>
              }
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: `
    .search-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .search-header {
      margin-bottom: 2rem;
    }

    .search-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 400;
    }

    .search-content {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
    }

    .search-filters {
      position: sticky;
      top: 2rem;
      height: fit-content;
    }

    .search-card {
      margin-bottom: 0;
    }

    .full-width {
      width: 100%;
    }

    .tags-section {
      margin-top: 1.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .selected-tags {
      margin-bottom: 1.5rem;
    }

    .available-tags h4 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .clickable-chip {
      cursor: pointer;
    }

    .clickable-chip:not([disabled]):hover {
      background-color: rgba(25, 118, 210, 0.1);
    }

    .tag-badge {
      margin-left: 4px;
    }

    .no-tags {
      color: rgba(0, 0, 0, 0.6);
      font-style: italic;
      margin: 0;
    }

    .results-card {
      min-height: 400px;
    }

    .result-count {
      color: rgba(0, 0, 0, 0.6);
      font-size: 1rem;
      font-weight: 400;
    }

    .no-results {
      text-align: center;
      padding: 3rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-results mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.4;
    }

    .no-results p {
      margin: 0.5rem 0;
    }

    .no-results .hint {
      font-size: 0.875rem;
      font-style: italic;
    }

    .workspace-result {
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .workspace-result:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .workspace-meta {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tags-preview {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .small-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .workspace-description {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.7);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 960px) {
      .search-content {
        grid-template-columns: 1fr;
      }

      .search-filters {
        position: static;
      }
    }
  `
})
export class SearchPageComponent {
  private router = inject(Router);
  readonly store = inject(WorkspaceStore);

  searchControl = new FormControl('');
  selectedTags = signal<string[]>([]);
  searchQuery = signal('');

  // Computed selectors
  allTags = selectAllTags(this.store.workspaces);
  tagsWithCount = selectTagsWithCount(this.store.workspaces);

  // Available tags (excluding already selected)
  availableTags = computed(() => {
    const selected = this.selectedTags();
    return this.tagsWithCount().filter(tc => !selected.includes(tc.tag));
  });

  // Filtered workspaces based on name and tags
  filteredWorkspaces = computed(() => {
    let workspaces = this.store.allWorkspaces();
    const query = this.searchQuery().toLowerCase().trim();
    const tags = this.selectedTags();

    // Filter by name
    if (query) {
      workspaces = workspaces.filter(ws =>
        ws.name.toLowerCase().includes(query)
      );
    }

    // Filter by tags (AND logic - workspace must have all selected tags)
    if (tags.length > 0) {
      workspaces = workspaces.filter(ws =>
        tags.every(tag => ws.tags.includes(tag))
      );
    }

    return workspaces;
  });

  constructor() {
    // Sync search control with signal
    effect(() => {
      const value = this.searchControl.value || '';
      this.searchQuery.set(value);
    });
  }

  addTagFilter(tag: string) {
    if (!this.selectedTags().includes(tag)) {
      this.selectedTags.update(tags => [...tags, tag]);
    }
  }

  removeTagFilter(tag: string) {
    this.selectedTags.update(tags => tags.filter(t => t !== tag));
  }

  clearTagFilters() {
    this.selectedTags.set([]);
  }

  clearNameSearch() {
    this.searchControl.setValue('');
  }

  navigateToWorkspace(id: string) {
    this.router.navigate(['/workspace', id]);
  }
}
