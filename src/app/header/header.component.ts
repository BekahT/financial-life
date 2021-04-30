import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() emitPanes = new EventEmitter<number>();

  onClick(panes: number): void {
    this.emitPanes.emit(panes);
  }
}
