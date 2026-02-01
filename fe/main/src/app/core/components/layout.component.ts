import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { map } from 'rxjs';

import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MatSidenavModule, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="layout-container">
      <app-header (menuToggle)="sidenav.toggle()" />
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav [mode]="sidenavMode()" [opened]="sidenavOpened()">
          <app-sidebar />
        </mat-sidenav>
        <mat-sidenav-content>
          <ng-content />
        </mat-sidenav-content>
      </mat-sidenav-container>
      <app-footer />
    </div>
  `,
  styles: `
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .sidenav-container {
      flex: 1;
    }
    mat-sidenav {
      width: 250px;
    }
  `
})
export class LayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);

  protected sidenavMode = computed(() =>
    this.isHandset() ? 'over' : 'side'
  );
  protected sidenavOpened = computed(() => !this.isHandset());

  private isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );
}
