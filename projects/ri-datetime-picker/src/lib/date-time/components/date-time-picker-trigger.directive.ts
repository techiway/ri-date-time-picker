/**
 * date-time-picker-trigger.directive
 */


import {
    AfterContentInit,
    ChangeDetectorRef,
    Directive,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges
} from '@angular/core';
import { merge, of as observableOf, Subscription } from 'rxjs';
import { RIDateTimeComponent } from './date-time-picker/date-time-picker.component';

@Directive({
    selector: '[riDateTimeTrigger]',
    host: {
        '(click)': 'handleClickOnHost($event)',
        '[class.ri-dt-trigger-disabled]': 'riDTTriggerDisabledClass'
    }
})
export class RIDateTimeTriggerDirective<T> implements OnInit, OnChanges, AfterContentInit, OnDestroy {

    @Input('riDateTimeTrigger') dtPicker: RIDateTimeComponent<T>;

    private _disabled: boolean;
    @Input()
    get disabled(): boolean {
        return this._disabled === undefined ? this.dtPicker.disabled : !!this._disabled;
    }

    set disabled( value: boolean ) {
        this._disabled = value;
    }

    get riDTTriggerDisabledClass(): boolean {
        return this.disabled;
    }

    private stateChanges = Subscription.EMPTY;

    constructor( protected changeDetector: ChangeDetectorRef ) {
    }

    public ngOnInit(): void {
    }

    public ngOnChanges( changes: SimpleChanges ) {
        if (changes.datepicker) {
            this.watchStateChanges();
        }
    }

    public ngAfterContentInit() {
        this.watchStateChanges();
    }

    public ngOnDestroy(): void {
        this.stateChanges.unsubscribe();
    }

    public handleClickOnHost( event: Event ): void {
        if (this.dtPicker) {
            this.dtPicker.open();
            event.stopPropagation();
        }
    }

    private watchStateChanges(): void {
        this.stateChanges.unsubscribe();

        const inputDisabled = this.dtPicker && this.dtPicker.dtInput ?
            this.dtPicker.dtInput.disabledChange : observableOf();

        const pickerDisabled = this.dtPicker ?
            this.dtPicker.disabledChange : observableOf();

        this.stateChanges = merge([pickerDisabled, inputDisabled])
            .subscribe(() => {
                this.changeDetector.markForCheck();
            });
    }
}
