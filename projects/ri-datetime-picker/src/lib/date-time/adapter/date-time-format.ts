import { InjectionToken } from "@angular/core";

export interface RIDateTimeFormats { 
    parseInput: any;
    fullPickerInput: any;
    datePickerInput: any;
    timePickerInput: any;
    monthYearLabel: any;
    dateA11yLabel: any;
    monthYearA11yLabel: any;
}

export const RI_DATE_TIME_FORMATS = new InjectionToken<RIDateTimeFormats>('RI_DATE_TIME_FORMATS');