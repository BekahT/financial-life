import { Component } from '@angular/core';

@Component({
  selector: 'app-component-selector',
  templateUrl: './component-selector.component.html',
  styleUrls: ['./component-selector.component.css']
})
export class ComponentSelectorComponent {
  selectedComponent: string = 'goals';

  onClick(component: string): void {
    this.selectedComponent = component;
  }
}
