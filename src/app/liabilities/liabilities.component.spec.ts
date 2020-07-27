import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilitiesComponent } from './liabilities.component';

describe('LiabilitiesComponent', () => {
  let component: LiabilitiesComponent;
  let fixture: ComponentFixture<LiabilitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiabilitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
