import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatToolbarModule],
  template: `
    <mat-toolbar class="footer">
      <span>© 2025 AI Document</span>
    </mat-toolbar>
  `,
  styles: `
    .footer {
      font-size: 12px;
      justify-content: center;
    }
  `
})
export class FooterComponent {}
