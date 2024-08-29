/**
 * native-date-time.module
 */

import { NgModule } from '@angular/core';
import { PlatformModule } from '@angular/cdk/platform';
import { DateTimeAdapter } from './date-time-adaptor';
import { RI_DATE_TIME_FORMATS } from './date-time-format';
import { NativeDateTimeAdapter } from './native-date-time-adapter';
import { RI_NATIVE_DATE_TIME_FORMATS } from './native-date-time-format';


@NgModule({
    imports: [PlatformModule],
    providers: [
        {provide: DateTimeAdapter, useClass: NativeDateTimeAdapter},
    ],
})
export class NativeDateTimeModule {
}

@NgModule({
    imports: [NativeDateTimeModule],
    providers: [{provide: RI_DATE_TIME_FORMATS, useValue: RI_NATIVE_DATE_TIME_FORMATS}],
})
export class RINativeDateTimeModule {
}
