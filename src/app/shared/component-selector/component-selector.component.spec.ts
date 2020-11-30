import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ComponentSelectorComponent } from './component-selector.component';

describe('ComponentSelectorComponent', () => {
  let component: ComponentSelectorComponent;
  let fixture: ComponentFixture<ComponentSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
