import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-component-selector',
  templateUrl: './component-selector.component.html',
  styleUrls: ['./component-selector.component.css']
})
export class ComponentSelectorComponent implements OnInit {
  selectedComponent: string = 'goals';

  constructor() { }

  ngOnInit(): void {
  }

  onClick(component: string) {
    this.selectedComponent = component;
  }
}
