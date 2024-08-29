/**
 * unix-timestamp-date-time.module
 */

import {NgModule} from '@angular/core';
import {PlatformModule} from '@angular/cdk/platform';
import {UnixTimestampDateTimeAdapter} from './unix-timestamp-date-time-adapter';
import { RI_DATE_TIME_FORMATS } from '../date-time-format';
import { DateTimeAdapter } from '../date-time-adaptor';
import { RI_UNIX_TIMESTAMP_DATE_TIME_FORMATS } from './unix-timestamp-date-time-format';

@NgModule({
    imports: [PlatformModule],
    providers: [
        {provide: DateTimeAdapter, useClass: UnixTimestampDateTimeAdapter},
    ],
})
export class UnixTimestampDateTimeModule {
}

@NgModule({
    imports: [UnixTimestampDateTimeModule],
    providers: [{provide: RI_DATE_TIME_FORMATS, useValue: RI_UNIX_TIMESTAMP_DATE_TIME_FORMATS}],
})
export class RIUnixTimestampDateTimeModule {
}
