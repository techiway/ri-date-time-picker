import { InjectionToken, inject, LOCALE_ID } from "@angular/core";
import { Observable, Subject } from "rxjs";



export const RI_DATE_TIME_LOCALE = new InjectionToken<string>('RI_DATE_TIME_LOCALE', {
    providedIn: 'root',
    factory: RI_DATE_TIME_LOCALE_FACTORY,
  });

  export  function RI_DATE_TIME_LOCALE_FACTORY(): string {
    return inject(LOCALE_ID);
  }

  /** Provider for RI_DATE_TIME_LOCALE injection token. */
export const RI_DATE_TIME_LOCALE_PROVIDER = {
    provide: RI_DATE_TIME_LOCALE,
    useExisting: LOCALE_ID
};

  export abstract class DateTimeAdapter<D, L = any> {
  
    protected locale: any;
    protected _localeChanges = new Subject<string>();
    get localeChanges(): Observable<string> {
        return this._localeChanges;
    }
    
     /** total milliseconds in a day. */
    protected readonly millisecondsInDay = 86400000;

    /** total milliseconds in a minute. */
    protected readonly milliseondsInMinute = 60000;

    abstract getYear(date: D): number;

    abstract getMonth(date: D): number;


    abstract getDay(date: D): number;

    abstract getDate(date: D): number;

    abstract getHours(date: D): number;

    abstract getMinutes(date: D): number;

    abstract getSeconds(date: D): number;

    abstract getTime(date: D): number;

    abstract getNumDaysInMonth(date: D): number;

    abstract differenceInCalendarDays(dateLeft: D, dateRight: D): number;

    abstract getYearName(date: D): string;

    abstract getMonthNames(style: 'long' | 'short' | 'narrow'): string[];

    abstract getDateNames(): string[];

    abstract getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    
    abstract createDate(year: number, month: number, date: number, hours?: number, minutes?: number, seconds?: number): D;

    abstract clone(date: D): D;

    abstract now(): D;

    abstract parse(value: any, parseFormat: string): D | null;

    abstract format(date: D, displayFormat: any): string;

    abstract addCalendarDays(date: D, days: number): D;

    abstract addCalendarMonths(date: D, months: number): D;

    abstract addCalendarYears(date: D, years: number): D;

    abstract toIso8601(date: D): string;

    abstract isSameDay(dateLeft: D, dateRight: D): boolean;

    abstract isEqual(dateLeft: D, dateRight: D): boolean;
        
    abstract isDateInstance(obj: any): boolean;

    abstract isValid(date: D): boolean;

    abstract invalid(): D;

    abstract setHours(date: D, hours: number): D;

    abstract setMinutes(date: D, minutes: number): D;

    abstract setSeconds(date: D, seconds: number): D;

  /**
     * Compare two given dates
     * 1 if the first date is after the second,
     * -1 if the first date is before the second
     * 0 if dates are equal.
     * */
  compare(first: D, second: D): number {
    if (!this.isValid(first) || !this.isValid(second)) {
        throw Error('JSNativeDate: Cannot compare invalid dates.');
    }

    const dateFirst = this.clone(first);
    const dateSecond = this.clone(second);

    const diff = this.getTime(dateFirst) - this.getTime(dateSecond);

    if (diff < 0) {
        return -1;
    } else if (diff > 0) {
        return 1;
    } else {
        // Return 0 if diff is 0; return NaN if diff is NaN
        return diff;
    }
}

/**
 * Check if two given dates are in the same year
 * 1 if the first date's year is after the second,
 * -1 if the first date's year is before the second
 * 0 if two given dates are in the same year
 * */
compareYear(first: D, second: D): number {
    if (!this.isValid(first) || !this.isValid(second)) {
        throw Error('JSNativeDate: Cannot compare invalid dates.');
    }

    const yearLeft = this.getYear(first);
    const yearRight = this.getYear(second);

    const diff = yearLeft - yearRight;

    if (diff < 0) {
        return -1;
    } else if (diff > 0) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Attempts to deserialize a value to a valid date object. This is different from parsing in that
 * deserialize should only accept non-ambiguous, locale-independent formats (e.g. a ISO 8601
 * string). The default implementation does not allow any deserialization, it simply checks that
 * the given value is already a valid date object or null. The `<mat-datepicker>` will call this
 * method on all of it's `@Input()` properties that accept dates. It is therefore possible to
 * support passing values from your backend directly to these properties by overriding this method
 * to also deserialize the format used by your backend.
 */
deserialize(value: any): D | null {
    if (
        value == null ||
        (this.isDateInstance(value) && this.isValid(value))
    ) {
        return value;
    }
    return this.invalid();
}

    /**
     * Sets the locale used for all dates.
     */
    setLocale(locale: string) {
        this.locale = locale;
        this._localeChanges.next(locale);
    }

     /**
     * Get the locale used for all dates.
     * */
    getLocale() {
        return this.locale;
    }


    /**
     * Clamp the given date between min and max dates.
     */
    clampDate(date: D, min?: D | null, max?: D | null): D {
        if (min && this.compare(date, min) < 0) {
            return min;
        }
        if (max && this.compare(date, max) > 0) {
            return max;
        }
        return date;
    }
 }