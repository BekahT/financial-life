import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() emitPanes = new EventEmitter<number>();
  
  constructor() { }

  ngOnInit(): void {
  }

  onClick(panes: number) {
    this.emitPanes.emit(panes);
  }

}
