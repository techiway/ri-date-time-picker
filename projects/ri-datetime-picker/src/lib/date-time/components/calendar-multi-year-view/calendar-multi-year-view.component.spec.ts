import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RIMultiYearViewComponent } from './calendar-multi-year-view.component';

describe('CalendarMultiYearViewComponent', () => {
  let component: RIMultiYearViewComponent<Date>;
  let fixture: ComponentFixture<RIMultiYearViewComponent<Date>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RIMultiYearViewComponent]
    });
    fixture = TestBed.createComponent(RIMultiYearViewComponent<Date>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
