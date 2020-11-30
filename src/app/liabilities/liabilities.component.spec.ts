import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LiabilitiesComponent } from './liabilities.component';

describe('LiabilitiesComponent', () => {
  let component: LiabilitiesComponent;
  let fixture: ComponentFixture<LiabilitiesComponent>;

  beforeEach(waitForAsync(() => {
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
