import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  Arr = Array;
  panes = 1;

  onEmitPanes(selectedPanes: number) {
    this.panes = selectedPanes;
  }
}
