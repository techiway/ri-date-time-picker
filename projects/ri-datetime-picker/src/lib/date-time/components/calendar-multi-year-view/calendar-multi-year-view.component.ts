import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, HOME, END, PAGE_UP, PAGE_DOWN, ENTER } from '@angular/cdk/keycodes';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { DateTimeAdapter } from '../../adapter/date-time-adaptor';
import { CalendarCell, RICalendarBodyComponent } from '../calendar-body/calendar-body.component';
import { SelectMode } from '../date-time.class';
import { RIDateTimeIntl } from '../date-time-picker-intl.service';
import { OptionsTokens } from '../options-provider';

@Component({
  selector: 'ri-date-time-multi-year-view',
  templateUrl: './calendar-multi-year-view.component.html',
  styleUrls: ['./calendar-multi-year-view.component.scss'],
  host: {
    '[class.ri-dt-calendar-view]': 'riDTCalendarView',
    '[class.ri-dt-calendar-multi-year-view]': 'riDTCalendarMultiYearView'
  },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class RIMultiYearViewComponent<D> implements OnInit, AfterContentInit {
  /**
     * The select mode of the picker;
     * */
  private _selectMode: SelectMode = 'single';
  @Input()
  get selectMode(): SelectMode {
      return this._selectMode;
  }

  set selectMode( val: SelectMode ) {
      this._selectMode = val;
      if (this.initiated) {
          this.setSelectedYears();
          this.cdRef.markForCheck();
      }
  }

  /** The currently selected date. */
  private _selected: D | null;
  @Input()
  get selected(): D | null {
      return this._selected;
  }

  set selected( value: D | null ) {
      const oldSelected = this._selected;
      value = this.dateTimeAdapter.deserialize(value);
      this._selected = this.getValidDate(value);

      if (!this.dateTimeAdapter.isSameDay(oldSelected, this._selected)) {
          this.setSelectedYears();
      }
  }

  private _selecteds: D[] = [];
  @Input()
  get selecteds(): D[] {
      return this._selecteds;
  }

  set selecteds( values: D[] ) {
      this._selecteds = values.map(( v ) => {
          v = this.dateTimeAdapter.deserialize(v);
          return this.getValidDate(v);
      });
      this.setSelectedYears();
  }

  private _pickerMoment: D | null;
  @Input()
  get pickerMoment() {
      return this._pickerMoment;
  }

  set pickerMoment( value: D ) {
      const oldMoment = this._pickerMoment;
      value = this.dateTimeAdapter.deserialize(value);
      this._pickerMoment = this.getValidDate(value) || this.dateTimeAdapter.now();

      if (oldMoment && this._pickerMoment &&
          !this.isSameYearList(oldMoment, this._pickerMoment)) {
          this.generateYearList();
      }
  }

  /**
   * A function used to filter which dates are selectable
   * */
  private _dateFilter: ( date: D ) => boolean;
  @Input()
  get dateFilter() {
      return this._dateFilter;
  }

  set dateFilter( filter: ( date: D ) => boolean ) {
      this._dateFilter = filter;
      if (this.initiated) {
          this.generateYearList();
      }
  }

  /** The minimum selectable date. */
  private _minDate: D | null;
  @Input()
  get minDate(): D | null {
      return this._minDate;
  }

  set minDate( value: D | null ) {
      value = this.dateTimeAdapter.deserialize(value);
      this._minDate = this.getValidDate(value);
      if (this.initiated) {
          this.generateYearList();
      }
  }

  /** The maximum selectable date. */
  private _maxDate: D | null;
  @Input()
  get maxDate(): D | null {
      return this._maxDate;
  }

  set maxDate( value: D | null ) {
      value = this.dateTimeAdapter.deserialize(value);
      this._maxDate = this.getValidDate(value);
      if (this.initiated) {
          this.generateYearList();
      }
  }

  private _todayYear: number;
  get todayYear(): number {
      return this._todayYear;
  }

  private _years: CalendarCell[][];
  get years() {
      return this._years;
  }

  private _selectedYears: number[];
  get selectedYears(): number[] {
      return this._selectedYears;
  }

  private initiated = false;

  get isInSingleMode(): boolean {
      return this.selectMode === 'single';
  }

  get isInRangeMode(): boolean {
      return this.selectMode === 'range' || this.selectMode === 'rangeFrom'
          || this.selectMode === 'rangeTo';
  }

  get activeCell(): number {
      if (this._pickerMoment) {
          return this.dateTimeAdapter.getYear(this._pickerMoment) % (this.options.yearsPerRow * this.options.yearRows);
      }

      return 0;
      
  }

  get tableHeader(): string {
      if (this._years && this._years.length > 0) {
          return `${this._years[0][0].displayValue} - ${this._years[this.options.yearRows - 1][this.options.yearsPerRow - 1].displayValue}`;
      } 

      return '';
  }

  get prevButtonLabel(): string {
      return this.pickerIntl.prevMultiYearLabel;
  }

  get nextButtonLabel(): string {
      return this.pickerIntl.nextMultiYearLabel;
  }

  /**
   * Callback to invoke when a new month is selected
   * */
  @Output() readonly change = new EventEmitter<D>();

  /**
   * Emits the selected year. This doesn't imply a change on the selected date
   * */
  @Output() readonly yearSelected = new EventEmitter<D>();

  /** Emits when any date is activated. */
  @Output() readonly pickerMomentChange: EventEmitter<D> = new EventEmitter<D>();

  /** Emits when use keyboard enter to select a calendar cell */
  @Output() readonly keyboardEnter: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public readonly prevYrSelect = new EventEmitter<void>();

  @Output()
  public readonly nextYrSelect = new EventEmitter<void>();
  
  /** The body of calendar table */
  @ViewChild(RICalendarBodyComponent, { static: true }) calendarBodyElm: RICalendarBodyComponent;

  get riDTCalendarView(): boolean {
      return true;
  }

  get riDTCalendarMultiYearView(): boolean {
      return true;
  }

  constructor( private cdRef: ChangeDetectorRef,
               private pickerIntl: RIDateTimeIntl,
               @Optional() private dateTimeAdapter: DateTimeAdapter<D>,
               @Inject(OptionsTokens.multiYear) private options: any) {
  }

  public ngOnInit() {
  }

  public ngAfterContentInit(): void {
      this._todayYear = this.dateTimeAdapter.getYear(this.dateTimeAdapter.now());
      this.generateYearList();
      this.initiated = true;
  }

  /**
   * Handle a calendarCell selected
   */
  public selectCalendarCell( cell: CalendarCell ): void {
      this.selectYear(cell.value);
  }

  private selectYear( year: number ): void {
      this.yearSelected.emit(this.dateTimeAdapter.createDate(year, 0, 1));
      const firstDateOfMonth = this.dateTimeAdapter.createDate(
          year,
          this.dateTimeAdapter.getMonth(this.pickerMoment),
          1
      );
      const daysInMonth = this.dateTimeAdapter.getNumDaysInMonth(firstDateOfMonth);
      const selected = this.dateTimeAdapter.createDate(
          year,
          this.dateTimeAdapter.getMonth(this.pickerMoment),
          Math.min(daysInMonth, this.dateTimeAdapter.getDate(this.pickerMoment)),
          this.dateTimeAdapter.getHours(this.pickerMoment),
          this.dateTimeAdapter.getMinutes(this.pickerMoment),
          this.dateTimeAdapter.getSeconds(this.pickerMoment),
      );

      this.change.emit(selected);
  }

  /**
   * Generate the previous year list
   * */
  public prevYearList( event: any ): void {
    console.log('prevYearList multi' + this.options);
    
      this._pickerMoment = this.dateTimeAdapter.addCalendarYears(this.pickerMoment, -1 * this.options.yearsPerRow * this.options.yearRows);
      this.generateYearList();
      event.preventDefault();
  }

  /**
   * Generate the next year list
   * */
  public nextYearList( event: any ): void {
      this._pickerMoment = this.dateTimeAdapter.addCalendarYears(this.pickerMoment, this.options.yearsPerRow * this.options.yearRows);
      this.generateYearList();
      event.preventDefault();
  }

  public generateYearList(): void {
      this._years = [];

      const pickerMomentYear = this.dateTimeAdapter.getYear(this._pickerMoment);
      const offset = pickerMomentYear % (this.options.yearsPerRow * this.options.yearRows);

      for (let i = 0; i < this.options.yearRows; i++) {
          const row = [];

          for (let j = 0; j < this.options.yearsPerRow; j++) {
              const year = pickerMomentYear - offset + (j + i * this.options.yearsPerRow);
              const yearCell = this.createYearCell(year);
              row.push(yearCell);
          }

          this._years.push(row);
      }

      this.cdRef.detectChanges();
      return;

  }

  /** Whether the previous period button is enabled. */
  public previousEnabled(): boolean {
      if (!this.minDate) {
          return true;
      }
      return !this.minDate || !this.isSameYearList(this._pickerMoment, this.minDate);
  }

  /** Whether the next period button is enabled. */
  public nextEnabled(): boolean {
      return !this.maxDate || !this.isSameYearList(this._pickerMoment, this.maxDate);
  }

  public handleCalendarKeydown( event: KeyboardEvent ): void {
      let moment;
      switch (event.keyCode) {
          // minus 1 year
          case LEFT_ARROW:
              moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment, -1);
              this.pickerMomentChange.emit(moment);
              break;

          // add 1 year
          case RIGHT_ARROW:
              moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment, 1);
              this.pickerMomentChange.emit(moment);
              break;

          // minus 3 years
          case UP_ARROW:
              moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment, -1 * this.options.yearsPerRow);
              this.pickerMomentChange.emit(moment);
              break;

          // add 3 years
          case DOWN_ARROW:
              moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment, this.options.yearsPerRow);
              this.pickerMomentChange.emit(moment);
              break;

          // go to the first year of the year page
          case HOME:
              moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment,
                  -this.dateTimeAdapter.getYear(this._pickerMoment) % (this.options.yearsPerRow * this.options.yearRows));
              this.pickerMomentChange.emit(moment);
              break;

          // go to the last year of the year page
          case END:
              moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment,
                  (this.options.yearsPerRow * this.options.yearRows) - this.dateTimeAdapter.getYear(this._pickerMoment) % (this.options.yearsPerRow * this.options.yearRows) - 1);
              this.pickerMomentChange.emit(moment);
              break;

          // minus 1 year page (or 10 year pages)
          case PAGE_UP:
              moment = this.dateTimeAdapter.addCalendarYears(this.pickerMoment, event.altKey ? -10 * (this.options.yearsPerRow * this.options.yearRows) : -1 * (this.options.yearsPerRow * this.options.yearRows));
              this.pickerMomentChange.emit(moment);
              break;

          // add 1 year page (or 10 year pages)
          case PAGE_DOWN:
              moment = this.dateTimeAdapter.addCalendarYears(this.pickerMoment, event.altKey ? 10 * (this.options.yearsPerRow * this.options.yearRows) : (this.options.yearsPerRow * this.options.yearRows));
              this.pickerMomentChange.emit(moment);
              break;

          case ENTER:
              this.selectYear(this.dateTimeAdapter.getYear(this._pickerMoment));
              this.keyboardEnter.emit();
              break;

          default:
              return;
      }

      this.focusActiveCell();
      event.preventDefault();
  }

  /**
   * Creates an CalendarCell for the given year.
   */
  private createYearCell( year: number ): CalendarCell {
      const startDateOfYear = this.dateTimeAdapter.createDate(year, 0, 1);
      const ariaLabel = this.dateTimeAdapter.getYearName(startDateOfYear);
      const cellClass = 'ri-dt-year-' + year;
      return new CalendarCell(year, year.toString(), ariaLabel, this.isYearEnabled(year), false, cellClass);
  }

  private setSelectedYears(): void {

      this._selectedYears = [];

      if (this.isInSingleMode && this.selected) {
          this._selectedYears[0] = this.dateTimeAdapter.getYear(this.selected);
      }

      if (this.isInRangeMode && this.selecteds) {
          this._selectedYears = this.selecteds.map(( selected ) => {
              if (this.dateTimeAdapter.isValid(selected)) {
                  return this.dateTimeAdapter.getYear(selected);
              } else {
                  return null;
              }
          });
      }
  }

  /** Whether the given year is enabled. */
  private isYearEnabled( year: number ) {
      // disable if the year is greater than maxDate lower than minDate
      if (year === undefined || year === null ||
          (this.maxDate && year > this.dateTimeAdapter.getYear(this.maxDate)) ||
          (this.minDate && year < this.dateTimeAdapter.getYear(this.minDate))) {
          return false;
      }

      // enable if it reaches here and there's no filter defined
      if (!this.dateFilter) {
          return true;
      }

      const firstOfYear = this.dateTimeAdapter.createDate(year, 0, 1);

      // If any date in the year is enabled count the year as enabled.
      for (let date = firstOfYear; this.dateTimeAdapter.getYear(date) === year;
           date = this.dateTimeAdapter.addCalendarDays(date, 1)) {
          if (this.dateFilter(date)) {
              return true;
          }
      }

      return false;
  }

  private isSameYearList( date1: D, date2: D ): boolean {
      return Math.floor(this.dateTimeAdapter.getYear(date1) / (this.options.yearsPerRow * this.options.yearRows)) ===
          Math.floor(this.dateTimeAdapter.getYear(date2) / (this.options.yearsPerRow * this.options.yearRows));
  }

  /**
   * Get a valid date object
   */
  private getValidDate( obj: any ): D | null {
      return (this.dateTimeAdapter.isDateInstance(obj) && this.dateTimeAdapter.isValid(obj)) ? obj : null;
  }

  private focusActiveCell() {
      this.calendarBodyElm.focusActiveCell();
  }
}
