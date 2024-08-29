import { getLocaleFirstDayOfWeek } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DateTimeAdapter } from '../../adapter/date-time-adaptor';
import { CalendarCell, RICalendarBodyComponent } from '../calendar-body/calendar-body.component';
import { SelectMode } from '../date-time.class';
import { RIDateTimeFormats, RI_DATE_TIME_FORMATS } from '../../adapter/date-time-format';
import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW
} from '@angular/cdk/keycodes';

const DAYS_PER_WEEK = 7;
const WEEKS_PER_VIEW = 6;


@Component({
  selector: 'ri-date-time-month-view',
  exportAs: 'riMonthView',
  templateUrl: './calendar-month-view.component.html',
  styleUrls: ['./calendar-month-view.component.scss'], 
  host: {
    '[class.ri-dt-calendar-view]': 'riDTCalendarView'
  },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RIMonthViewComponent<D> implements OnInit, AfterContentInit, OnDestroy{

   /**
     * Whether to hide dates in other months at the start or end of the current month.
     * */
   @Input()
   hideOtherMonths = false;
   
   /**
    * Whether to show calendar weeks in the calendar
    * */
   @Input()
   showCalendarWeeks = false;

   private isDefaultFirstDayOfWeek = true;

   /**
    * Define the first day of a week
    * Sunday: 0 - Saturday: 6
    * */
   private _firstDayOfWeek!: number;

   @Input()
   get firstDayOfWeek(): number {
       return this._firstDayOfWeek;
   }

   set firstDayOfWeek(val: number) {
       if (val >= 0 && val <= 6 && val !== this._firstDayOfWeek) {
           this._firstDayOfWeek = val;
           this.isDefaultFirstDayOfWeek = false;

           if (this.initiated) {
               this.generateWeekDays();
               this.generateCalendar();
               this.cdRef.markForCheck();
           }
       }
   }

   /**
    * The select mode of the picker;
    * */
   private _selectMode: SelectMode = 'single';
   @Input()
   get selectMode(): SelectMode {
       return this._selectMode;
   }

   set selectMode(val: SelectMode) {
       this._selectMode = val;
       if (this.initiated) {
           this.generateCalendar();
           this.cdRef.markForCheck();
       }
   }

   /** The currently selected date. */
   private _selected!: D | null;
   @Input()
   get selected(): D | null {
       return this._selected;
   }

   set selected(value: D | null) {
       const oldSelected = this._selected;
       value = this.dateTimeAdapter.deserialize(value);
       this._selected = this.getValidDate(value);

       if (!this.dateTimeAdapter.isSameDay(oldSelected, this._selected)) {
           this.setSelectedDates();
       }
   }

   private _selecteds!: D[];
   @Input()
   get selecteds(): D[] {
       return this._selecteds;
   }

   set selecteds(values: D[]) {
       this._selecteds = values.map(v => {
           v = this.dateTimeAdapter.deserialize(v);
           return this.getValidDate(v);
       });
       this.setSelectedDates();
   }

   private _pickerMoment!: D;
   @Input()
   get pickerMoment() {
       return this._pickerMoment;
   }

   set pickerMoment(value: D) {
       const oldMoment = this._pickerMoment;
       value = this.dateTimeAdapter.deserialize(value) as any;
       this._pickerMoment =
           this.getValidDate(value) || this.dateTimeAdapter.now();

       this.firstDateOfMonth = this.dateTimeAdapter.createDate(
           this.dateTimeAdapter.getYear(this._pickerMoment),
           this.dateTimeAdapter.getMonth(this._pickerMoment),
           1
       );

       if (
           !this.isSameMonth(oldMoment, this._pickerMoment) &&
           this.initiated
       ) {
           this.generateCalendar();
       }
   }

   /**
    * A function used to filter which dates are selectable
    * */
   private _dateFilter!: (date: D) => boolean;
   @Input()
   get dateFilter() {
       return this._dateFilter;
   }

   set dateFilter(filter: (date: D) => boolean) {
       this._dateFilter = filter;
       if (this.initiated) {
           this.generateCalendar();
           this.cdRef.markForCheck();
       }
   }

   /** The minimum selectable date. */
   private _minDate!: D | null;
   @Input()
   get minDate(): D | null {
       return this._minDate;
   }

   set minDate(value: D | null) {
       value = this.dateTimeAdapter.deserialize(value);
       this._minDate = this.getValidDate(value);
       if (this.initiated) {
           this.generateCalendar();
           this.cdRef.markForCheck();
       }
   }

   /** The maximum selectable date. */
   private _maxDate!: D | null;
   @Input()
   get maxDate(): D | null {
       return this._maxDate;
   }

   set maxDate(value: D | null) {
       value = this.dateTimeAdapter.deserialize(value);
       this._maxDate = this.getValidDate(value);

       if (this.initiated) {
           this.generateCalendar();
           this.cdRef.markForCheck();
       }
   }

   private _weekdays!: Array<{ long: string; short: string; narrow: string }>;
   get weekdays() {
       return this._weekdays;
   }

   private _days!: CalendarCell[][];
   get days() {
       return this._days;
   }

     get activeCell(): number | undefined {
       if (this.pickerMoment) {
         return (
           this.dateTimeAdapter.getDate(this.pickerMoment) +
           this.firstRowOffset -
           1
         );
       }
       return undefined;
     }

     get isInSingleMode(): boolean {
       return this.selectMode === 'single';
     }

   get isInRangeMode(): boolean {
       return (
           this.selectMode === 'range' ||
           this.selectMode === 'rangeFrom' ||
           this.selectMode === 'rangeTo'
       );
   }

   private firstDateOfMonth!: D;

   private localeSub: Subscription = Subscription.EMPTY;

   private initiated = false;

   private dateNames!: string[];

   /**
    * The date of the month that today falls on.
    * */
   public todayDate!: number | null;

   /**
    * Week day numbers
    * */
   public weekNumbers!: number[];

   /**
    * An array to hold all selectedDates' value
    * the value is the day number in current month
    * */
   public selectedDates: number[] = [];

   // the index of cell that contains the first date of the month
   public firstRowOffset!: number;

   /**
    * Callback to invoke when a new date is selected
    * */
   @Output()
   readonly selectedChange = new EventEmitter<D | null>();

   /**
    * Callback to invoke when any date is selected.
    * */
   @Output()
   readonly userSelection = new EventEmitter<void>();

   /** Emits when any date is activated. */
   @Output()
   readonly pickerMomentChange: EventEmitter<D> = new EventEmitter<D>();

   /** The body of calendar table */
   @ViewChild(RICalendarBodyComponent, { static: true })
   calendarBodyElm!: RICalendarBodyComponent;

   get riDTCalendarView(): boolean {
       return true;
   }

   constructor(
       private cdRef: ChangeDetectorRef,
       @Optional() private dateTimeAdapter: DateTimeAdapter<D>,
       @Optional()
       @Inject(RI_DATE_TIME_FORMATS)
       private dateTimeFormats: RIDateTimeFormats
   ) {}

   public ngOnInit() {
       this.updateFirstDayOfWeek(this.dateTimeAdapter.getLocale());
       this.generateWeekDays();

       this.localeSub = this.dateTimeAdapter.localeChanges.subscribe(
           locale => {
               this.updateFirstDayOfWeek(locale);
               this.generateWeekDays();
               this.generateCalendar();
               this.cdRef.markForCheck();
           }
       );
   }

   public ngAfterContentInit(): void {
       this.generateCalendar();
       this.initiated = true;
   }

   public ngOnDestroy(): void {
       this.localeSub.unsubscribe();
   }

   /**
    * Handle a calendarCell selected
    */
   public selectCalendarCell(cell: CalendarCell): void {
       // Cases in which the date would not be selected
       // 1, the calendar cell is NOT enabled (is NOT valid)
       // 2, the selected date is NOT in current picker's month and the hideOtherMonths is enabled
       if (!cell.enabled || (this.hideOtherMonths && cell.out)) {
           return;
       }

       this.selectDate(cell.value);
   }

   /**
    * Handle a new date selected
    */
   private selectDate(date: number): void {
       const daysDiff = date - 1;
       const selected = this.dateTimeAdapter.addCalendarDays(
           this.firstDateOfMonth,
           daysDiff
       );

       this.selectedChange.emit(selected);
       this.userSelection.emit();
   }

   /**
    * Handle keydown event on calendar body
    */
   public handleCalendarKeydown(event: KeyboardEvent): void {
       let moment;
       switch (event.keyCode) {
           // minus 1 day
           case LEFT_ARROW:
               moment = this.dateTimeAdapter.addCalendarDays(
                   this.pickerMoment,
                   -1
               );
               this.pickerMomentChange.emit(moment);
               break;

           // add 1 day
           case RIGHT_ARROW:
               moment = this.dateTimeAdapter.addCalendarDays(
                   this.pickerMoment,
                   1
               );
               this.pickerMomentChange.emit(moment);
               break;

           // minus 1 week
           case UP_ARROW:
               moment = this.dateTimeAdapter.addCalendarDays(
                   this.pickerMoment,
                   -7
               );
               this.pickerMomentChange.emit(moment);
               break;

           // add 1 week
           case DOWN_ARROW:
               moment = this.dateTimeAdapter.addCalendarDays(
                   this.pickerMoment,
                   7
               );
               this.pickerMomentChange.emit(moment);
               break;

           // move to first day of current month
           case HOME:
               moment = this.dateTimeAdapter.addCalendarDays(
                   this.pickerMoment,
                   1 - this.dateTimeAdapter.getDate(this.pickerMoment)
               );
               this.pickerMomentChange.emit(moment);
               break;

           // move to last day of current month
           case END:
               moment = this.dateTimeAdapter.addCalendarDays(
                   this.pickerMoment,
                   this.dateTimeAdapter.getNumDaysInMonth(this.pickerMoment) -
                       this.dateTimeAdapter.getDate(this.pickerMoment)
               );
               this.pickerMomentChange.emit(moment);
               break;

           // minus 1 month (or 1 year)
           case PAGE_UP:
               moment = event.altKey
                   ? this.dateTimeAdapter.addCalendarYears(
                         this.pickerMoment,
                         -1
                     )
                   : this.dateTimeAdapter.addCalendarMonths(
                         this.pickerMoment,
                         -1
                     );
               this.pickerMomentChange.emit(moment);
               break;

           // add 1 month (or 1 year)
           case PAGE_DOWN:
               moment = event.altKey
                   ? this.dateTimeAdapter.addCalendarYears(
                         this.pickerMoment,
                         1
                     )
                   : this.dateTimeAdapter.addCalendarMonths(
                         this.pickerMoment,
                         1
                     );
               this.pickerMomentChange.emit(moment);
               break;

           // select the pickerMoment
           case ENTER:
               if (!this.dateFilter || this.dateFilter(this.pickerMoment)) {
                   this.selectDate(
                       this.dateTimeAdapter.getDate(this.pickerMoment)
                   );
               }
               break;
           default:
               return;
       }

       this.focusActiveCell();
       event.preventDefault();
   }

   /**
    * Generate the calendar weekdays array
    * */
   private generateWeekDays(): void {
       const longWeekdays = this.dateTimeAdapter.getDayOfWeekNames('long');
       const shortWeekdays = this.dateTimeAdapter.getDayOfWeekNames('short');
       const narrowWeekdays = this.dateTimeAdapter.getDayOfWeekNames('narrow');
       const firstDayOfWeek = this.firstDayOfWeek;

       const weekdays = longWeekdays.map((long, i) => {
           return { long, short: shortWeekdays[i], narrow: narrowWeekdays[i] };
       });

       this._weekdays = weekdays
           .slice(firstDayOfWeek)
           .concat(weekdays.slice(0, firstDayOfWeek));

       this.dateNames = this.dateTimeAdapter.getDateNames();

       return;
   }

   /**
    * Generate the calendar days array
    * */
   private generateCalendar(): void {
       if (!this.pickerMoment) {
           return;
       }

       this.todayDate = null;
       this.weekNumbers = [];

       // the first weekday of the month
       const startWeekdayOfMonth = this.dateTimeAdapter.getDay(
           this.firstDateOfMonth
       );
       const firstDayOfWeek = this.firstDayOfWeek;

       // the amount of days from the first date of the month
       // if it is < 0, it means the date is in previous month
       let daysDiff =
           0 -
           ((startWeekdayOfMonth + (DAYS_PER_WEEK - firstDayOfWeek)) %
               DAYS_PER_WEEK);

       // the index of cell that contains the first date of the month
       this.firstRowOffset = Math.abs(daysDiff);

       this._days = [];
       for (let i = 0; i < WEEKS_PER_VIEW; i++) {
           const week = [];
           for (let j = 0; j < DAYS_PER_WEEK; j++) {
               const date = this.dateTimeAdapter.addCalendarDays(
                   this.firstDateOfMonth,
                   daysDiff
               );
               const dateCell = this.createDateCell(date, daysDiff);
               // check if the date is today
               if (
                   this.dateTimeAdapter.isSameDay(
                       this.dateTimeAdapter.now(),
                       date
                   )
               ) {
                   this.todayDate = daysDiff + 1;
               }

               week.push(dateCell);
               daysDiff += 1;
           }
           this._days.push(week);
           if (this.showCalendarWeeks) {
               const weekNumber = this.getISOWeek(new Date(week[0].ariaLabel));
               this.weekNumbers.push(weekNumber);
           }
       }
       this.setSelectedDates();
   }

   public getISOWeek(d: Date): number {
       const clonedDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
       // Make Sunday's day number 7
       clonedDate.setUTCDate(clonedDate.getUTCDate() + 4 - (clonedDate.getUTCDay()||7));
       // Get first day of year
       const yearStart = new Date(Date.UTC(clonedDate.getUTCFullYear(),0,1));
       // Calculate full weeks to nearest Thursday
       const weekNo = Math.ceil(( ( (+clonedDate - +yearStart) / 86400000) + 1)/7);
       return weekNo;
   }

   private updateFirstDayOfWeek(locale: string): void {
       if (this.isDefaultFirstDayOfWeek) {
           try {
               this._firstDayOfWeek = getLocaleFirstDayOfWeek(locale);
           } catch {
               this._firstDayOfWeek = 0;
           }
       }
   }

   /**
    * Creates CalendarCell for days.
    */
   private createDateCell(date: D, daysDiff: number): CalendarCell {
       // total days of the month
       const daysInMonth = this.dateTimeAdapter.getNumDaysInMonth(
           this.pickerMoment
       );
       const dateNum = this.dateTimeAdapter.getDate(date);
       // const dateName = this.dateNames[dateNum - 1];
       const dateName = dateNum.toString();
       const ariaLabel = this.dateTimeAdapter.format(
           date,
           this.dateTimeFormats.dateA11yLabel
       );

       // check if the date if selectable
       const enabled = this.isDateEnabled(date);

       // check if date is not in current month
       const dayValue = daysDiff + 1;
       const out = dayValue < 1 || dayValue > daysInMonth;
       const cellClass = 'ri-dt-day-' + this.dateTimeAdapter.getDay(date);

       return new CalendarCell(
           dayValue,
           dateName,
           ariaLabel,
           enabled,
           out,
           cellClass
       );
   }

   /**
    * Check if the date is valid
    */
   private isDateEnabled(date: D): boolean {
       return (
           !!date &&
           (!this.dateFilter || this.dateFilter(date)) &&
           (!this.minDate ||
               this.dateTimeAdapter.compare(date, this.minDate) >= 0) &&
           (!this.maxDate ||
               this.dateTimeAdapter.compare(date, this.maxDate) <= 0)
       );
   }

   /**
    * Get a valid date object
    */
   private getValidDate(obj: any): D | null {
       return this.dateTimeAdapter.isDateInstance(obj) &&
           this.dateTimeAdapter.isValid(obj)
           ? obj
           : null;
   }

   /**
    * Check if the give dates are none-null and in the same month
    */
   public isSameMonth(dateLeft: D, dateRight: D): boolean {
       return !!(
           dateLeft &&
           dateRight &&
           this.dateTimeAdapter.isValid(dateLeft) &&
           this.dateTimeAdapter.isValid(dateRight) &&
           this.dateTimeAdapter.getYear(dateLeft) ===
               this.dateTimeAdapter.getYear(dateRight) &&
           this.dateTimeAdapter.getMonth(dateLeft) ===
               this.dateTimeAdapter.getMonth(dateRight)
       );
   }

   /**
    * Set the selectedDates value.
    * In single mode, it has only one value which represent the selected date
    * In range mode, it would has two values, one for the fromValue and the other for the toValue
    * */
   private setSelectedDates(): void {
       this.selectedDates = [];

       if (!this.firstDateOfMonth) {
           return;
       }

       if (this.isInSingleMode && this.selected) {
           const dayDiff = this.dateTimeAdapter.differenceInCalendarDays(
               this.selected,
               this.firstDateOfMonth
           );
           this.selectedDates[0] = dayDiff + 1;
           return;
       }

       if (this.isInRangeMode && this.selecteds) {
           this.selectedDates = this.selecteds.map(selected => {
               if (this.dateTimeAdapter.isValid(selected)) {
                   const dayDiff = this.dateTimeAdapter.differenceInCalendarDays(
                       selected,
                       this.firstDateOfMonth
                   );
                   return dayDiff + 1;
               } else {
                   return null;
               }
           });
       }
   }

   private focusActiveCell() {
       this.calendarBodyElm.focusActiveCell();
   }
}
