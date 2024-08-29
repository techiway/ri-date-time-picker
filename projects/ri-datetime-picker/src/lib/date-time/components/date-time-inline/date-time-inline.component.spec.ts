import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RIDateTimeInlineComponent } from './date-time-inline.component';

describe('DateTimeInlineComponent', () => {
  let component: RIDateTimeInlineComponent<Date>;
  let fixture: ComponentFixture<RIDateTimeInlineComponent<Date>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RIDateTimeInlineComponent]
    });
    fixture = TestBed.createComponent(RIDateTimeInlineComponent<Date>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
