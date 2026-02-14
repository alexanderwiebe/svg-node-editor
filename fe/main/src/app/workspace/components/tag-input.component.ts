import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ViewChild,
  ElementRef,
  inject
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Tags</mat-label>
      <mat-chip-grid #chipGrid>
        @for (tag of tags(); track tag) {
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
        placeholder="Add tags..."
        #tagInput
        [formControl]="tagControl"
        [matChipInputFor]="chipGrid"
        [matAutocomplete]="auto"
        [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
        (matChipInputTokenEnd)="addTagFromInput($event)"
        data-testid="tag-input">
      <mat-autocomplete
        #auto="matAutocomplete"
        (optionSelected)="selectTagFromAutocomplete($event)">
        @for (tag of filteredExistingTags(); track tag) {
          <mat-option [value]="tag" data-testid="tag-autocomplete-option">
            {{ tag }}
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    .full-width {
      width: 100%;
    }

    mat-chip-grid {
      margin-bottom: 8px;
    }
  `
})
export class TagInputComponent {
  @Input() set value(tags: string[]) {
    this.tags.set(tags || []);
  }
  @Input() existingTags: string[] = [];
  @Output() valueChange = new EventEmitter<string[]>();

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  tags = signal<string[]>([]);
  tagControl = new FormControl('');
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  // Filter existing tags based on input and exclude already added tags
  filteredExistingTags = computed(() => {
    const input = (this.tagControl.value || '').toLowerCase().trim();
    const currentTags = this.tags();

    if (!input) {
      // Show all existing tags that aren't already added
      return this.existingTags.filter(tag => !currentTags.includes(tag));
    }

    // Show existing tags that match input and aren't already added
    return this.existingTags.filter(tag =>
      tag.toLowerCase().includes(input) && !currentTags.includes(tag)
    );
  });

  addTagFromInput(event: any): void {
    const value = (event.value || '').trim();

    if (value) {
      this.addTag(value);
    }

    // Clear input
    event.chipInput?.clear();
    this.tagControl.setValue('');
  }

  selectTagFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    this.addTag(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagControl.setValue('');
  }

  private addTag(tag: string): void {
    const trimmedTag = tag.trim();
    if (trimmedTag && !this.tags().includes(trimmedTag)) {
      const newTags = [...this.tags(), trimmedTag];
      this.tags.set(newTags);
      this.valueChange.emit(newTags);
    }
  }

  removeTag(tag: string): void {
    const newTags = this.tags().filter(t => t !== tag);
    this.tags.set(newTags);
    this.valueChange.emit(newTags);
  }
}
