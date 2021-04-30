import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  arr = Array;
  panes = 1;
  title = 'financial-life';

  onEmitPanes(selectedPanes: number): void {
    this.panes = selectedPanes;
  }
}
