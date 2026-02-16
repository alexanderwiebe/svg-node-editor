import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-svg-canvas',
  standalone: true,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg">
      <g #transformGroup></g>
    </svg>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
      user-select: none;
      touch-action: none;
      -webkit-user-drag: none;
    }
  `
})
export class SvgCanvasComponent {
  @ViewChild('transformGroup', { static: true }) transformGroup!: ElementRef<SVGGElement>;
}
