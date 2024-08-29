import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RICustomTimerBoxComponent } from './custom-timer-box.component';

describe('CustomTimerBoxComponent', () => {
  let component: RICustomTimerBoxComponent;
  let fixture: ComponentFixture<RICustomTimerBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RICustomTimerBoxComponent]
    });
    fixture = TestBed.createComponent(RICustomTimerBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
