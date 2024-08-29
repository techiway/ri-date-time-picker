/**
 * unix-timestamp-date-time-format.class
 */

import { RIDateTimeFormats } from "../date-time-format";

export const RI_UNIX_TIMESTAMP_DATE_TIME_FORMATS: RIDateTimeFormats = {
    parseInput: null,
    fullPickerInput: {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'},
    datePickerInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
    timePickerInput: {hour: 'numeric', minute: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
};
