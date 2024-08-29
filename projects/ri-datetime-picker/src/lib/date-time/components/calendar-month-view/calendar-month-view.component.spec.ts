import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RIMonthViewComponent } from './calendar-month-view.component';

describe('RIMonthViewComponent', () => {
  let component: RIMonthViewComponent<Date>;
  let fixture: ComponentFixture<RIMonthViewComponent<Date>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RIMonthViewComponent]
    });
    fixture = TestBed.createComponent(RIMonthViewComponent<Date>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
