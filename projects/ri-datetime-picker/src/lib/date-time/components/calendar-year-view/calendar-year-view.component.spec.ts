import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RIYearViewComponent } from './calendar-year-view.component';

describe('RIYearViewComponent<Date>', () => {
  let component: RIYearViewComponent<Date>;
  let fixture: ComponentFixture<RIYearViewComponent<Date>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RIYearViewComponent<Date>]
    });
    fixture = TestBed.createComponent(RIYearViewComponent<Date>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
