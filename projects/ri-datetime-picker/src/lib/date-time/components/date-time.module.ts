



import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { RICalendarBodyComponent } from './calendar-body/calendar-body.component';
import { RIMonthViewComponent } from './calendar-month-view/calendar-month-view.component';
import { RIMultiYearViewComponent } from './calendar-multi-year-view/calendar-multi-year-view.component';
import { RIYearViewComponent } from './calendar-year-view/calendar-year-view.component';
import { RICalendarComponent } from './calendar/calendar.component';
import { RIDateTimeContainerComponent } from './date-time-container/date-time-container.component';
import { RIDateTimeComponent, RI_DTPICKER_SCROLL_STRATEGY_PROVIDER } from './date-time-picker/date-time-picker.component';
import { RITimerComponent } from './timer/timer.component';
import { RITimerBoxComponent } from './timer-box/timer-box.component';
import { RIDateTimeInlineComponent } from './date-time-inline/date-time-inline.component';
import { RIDateTimeTriggerDirective } from './date-time-picker-trigger.directive';
import { RIDateTimeInputDirective } from './date-time-picker-input.directive';
import { NumberFixedLenPipe } from './numberedFixLen.pipe';
import { RIDateTimeIntl } from './date-time-picker-intl.service';
import { optionsProviders } from './options-provider';
import { RIDialogModule } from '../../dialog/dialog.module';
import { RICustomTimerBoxComponent } from './custom-timer-box/custom-timer-box.component';

@NgModule({
    imports: [CommonModule, OverlayModule, A11yModule, RIDialogModule],
    exports: [
        RICalendarComponent,
        RITimerComponent,
        RIDateTimeTriggerDirective,
        RIDateTimeInputDirective,
        RIDateTimeComponent,
        RIDateTimeInlineComponent, 
        RIMultiYearViewComponent,
        RIYearViewComponent, 
        RIMonthViewComponent
    ],
    declarations: [
        RIDateTimeTriggerDirective,
        RIDateTimeInputDirective,

        NumberFixedLenPipe,
        
        RICalendarBodyComponent,
        RIMonthViewComponent,
        RIMultiYearViewComponent,
        RIYearViewComponent,
        RICalendarComponent,
        RIDateTimeContainerComponent,
        RIDateTimeComponent, 
        RITimerComponent,
        RITimerBoxComponent,
        RIDateTimeInlineComponent,
        RICustomTimerBoxComponent
    ], 
    providers: [
        RIDateTimeIntl,
        RI_DTPICKER_SCROLL_STRATEGY_PROVIDER,
        ...optionsProviders
    ]
})
export class RIDateTimeModule {
}