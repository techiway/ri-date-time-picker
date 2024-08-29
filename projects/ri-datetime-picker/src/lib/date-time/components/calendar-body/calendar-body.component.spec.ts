import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RICalendarBodyComponent } from './calendar-body.component';

describe('CalendarBodyComponent', () => {
  let component: RICalendarBodyComponent;
  let fixture: ComponentFixture<RICalendarBodyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RICalendarBodyComponent]
    });
    fixture = TestBed.createComponent(RICalendarBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
