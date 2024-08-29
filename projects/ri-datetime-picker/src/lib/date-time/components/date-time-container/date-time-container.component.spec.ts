import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RIDateTimeContainerComponent } from './date-time-container.component';

describe('DateTimeContainerComponent', () => {
  let component: RIDateTimeContainerComponent<Date>;
  let fixture: ComponentFixture<RIDateTimeContainerComponent<Date>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RIDateTimeContainerComponent]
    });
    fixture = TestBed.createComponent(RIDateTimeContainerComponent<Date>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
