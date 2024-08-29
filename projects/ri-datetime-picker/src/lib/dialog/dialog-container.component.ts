/**
 * dialog-container.component
 */

import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    EventEmitter,
    Inject,
    OnInit,
    Optional,
    ViewChild
} from '@angular/core';
import {
    animate,
    animateChild,
    AnimationEvent,
    keyframes,
    style,
    transition,
    trigger
} from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import {
    BasePortalOutlet,
    CdkPortalOutlet,
    ComponentPortal,
    TemplatePortal
} from '@angular/cdk/portal';
import { RIDialogConfigInterface } from './dialog-config.class';

const zoomFadeIn = {
    opacity: 0,
    transform: 'translateX({{ x }}) translateY({{ y }}) scale({{scale}})'
};
const zoomFadeInFrom = {
    opacity: 0,
    transform: 'translateX({{ x }}) translateY({{ y }}) scale({{scale}})',
    transformOrigin: '{{ ox }} {{ oy }}'
};

@Component({
    selector: 'ri-dialog-container',
    templateUrl: './dialog-container.component.html',
    animations: [
        trigger('slideModal', [
            transition(
                'void => enter',
                [
                    style(zoomFadeInFrom),
                    animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style('*')),
                    animate(
                        '150ms',
                        keyframes([
                            style({ transform: 'scale(1)', offset: 0 }),
                            style({ transform: 'scale(1.05)', offset: 0.3 }),
                            style({ transform: 'scale(.95)', offset: 0.8 }),
                            style({ transform: 'scale(1)', offset: 1.0 })
                        ])
                    ),
                    animateChild()
                ],
                {
                    params: {
                        x: '0px',
                        y: '0px',
                        ox: '50%',
                        oy: '50%',
                        scale: 1
                    }
                }
            ),
            transition(
                'enter => exit',
                [animateChild(), animate(200, style(zoomFadeIn))],
                { params: { x: '0px', y: '0px', ox: '50%', oy: '50%' } }
            )
        ])
    ],
    host: {
        '(@slideModal.start)': 'onAnimationStart($event)',
        '(@slideModal.done)': 'onAnimationDone($event)',
        '[class.ri-dialog-container]': 'riDialogContainerClass',
        '[attr.tabindex]': 'riDialogContainerTabIndex',
        '[attr.id]': 'riDialogContainerId',
        '[attr.role]': 'riDialogContainerRole',
        '[attr.aria-labelledby]': 'riDialogContainerAriaLabelledby',
        '[attr.aria-describedby]': 'riDialogContainerAriaDescribedby',
        '[@slideModal]': 'riDialogContainerAnimation'
    }
})
export class RIDialogContainerComponent extends BasePortalOutlet
    implements OnInit {
    @ViewChild(CdkPortalOutlet, { static: true })
    portalOutlet: CdkPortalOutlet | null = null;

    /** The class that traps and manages focus within the dialog. */
    private focusTrap: FocusTrap;

    /** ID of the element that should be considered as the dialog's label. */
    public ariaLabelledBy: string | null = null;

    /** Emits when an animation state changes. */
    public animationStateChanged = new EventEmitter<AnimationEvent>();

    public isAnimating = false;

    private _config: RIDialogConfigInterface;
    get config(): RIDialogConfigInterface {
        return this._config;
    }

    private state: 'void' | 'enter' | 'exit' = 'enter';

    // for animation purpose
    private params: any = {
        x: '0px',
        y: '0px',
        ox: '50%',
        oy: '50%',
        scale: 0
    };

    // A variable to hold the focused element before the dialog was open.
    // This would help us to refocus back to element when the dialog was closed.
    private elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

    get riDialogContainerClass(): boolean {
        return true;
    }

    get riDialogContainerTabIndex(): number {
        return -1;
    }

    get riDialogContainerId(): string {
        return this._config.id;
    }

    get riDialogContainerRole(): string {
        return this._config.role || null;
    }

    get riDialogContainerAriaLabelledby(): string {
        return this.ariaLabelledBy;
    }

    get riDialogContainerAriaDescribedby(): string {
        return this._config.ariaDescribedBy || null;
    }

    get riDialogContainerAnimation(): any {
        return { value: this.state, params: this.params };
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private elementRef: ElementRef,
        private focusTrapFactory: FocusTrapFactory,
        @Optional()
        @Inject(DOCUMENT)
        private document: any
    ) {
        super();
    }

    public ngOnInit() {}

    /**
     * Attach a ComponentPortal as content to this dialog container.
     */
    public attachComponentPortal<T>(
        portal: ComponentPortal<T>
    ): ComponentRef<T> {
        if (this.portalOutlet.hasAttached()) {
            throw Error(
                'Attempting to attach dialog content after content is already attached'
            );
        }

        this.savePreviouslyFocusedElement();
        return this.portalOutlet.attachComponentPortal(portal);
    }

    public attachTemplatePortal<C>(
        portal: TemplatePortal<C>
    ): EmbeddedViewRef<C> {
        throw new Error('Method not implemented.');
    }

    public setConfig(config: RIDialogConfigInterface): void {
        this._config = config;

        if (config.event) {
            this.calculateZoomOrigin(event);
        }
    }

    public onAnimationStart( event: AnimationEvent ): void {
        this.isAnimating = true;
        this.animationStateChanged.emit(event);
    }

    public onAnimationDone( event: AnimationEvent ): void {
        if (event.toState === 'enter') {
            this.trapFocus();
        } else if (event.toState === 'exit') {
            this.restoreFocus();
        }

        this.animationStateChanged.emit(event);
        this.isAnimating = false;
    }

    public startExitAnimation() {
        this.state = 'exit';
        this.changeDetector.markForCheck();
    }

    /**
     * Calculate origin used in the `zoomFadeInFrom()`
     * for animation purpose
     */
    private calculateZoomOrigin(event: any): void {
        if (!event) {
            return;
        }

        const clientX = event.clientX;
        const clientY = event.clientY;

        const wh = window.innerWidth / 2;
        const hh = window.innerHeight / 2;
        const x = clientX - wh;
        const y = clientY - hh;
        const ox = clientX / window.innerWidth;
        const oy = clientY / window.innerHeight;

        this.params.x = `${x}px`;
        this.params.y = `${y}px`;
        this.params.ox = `${ox * 100}%`;
        this.params.oy = `${oy * 100}%`;
        this.params.scale = 0;

        return;
    }

    /**
     * Save the focused element before dialog was open
     */
    private savePreviouslyFocusedElement(): void {
        if (this.document) {
            this.elementFocusedBeforeDialogWasOpened = this.document
                .activeElement as HTMLElement;

            Promise.resolve().then(() => this.elementRef.nativeElement.focus());
        }
    }

    private trapFocus(): void {
        if (!this.focusTrap) {
            this.focusTrap = this.focusTrapFactory.create(
                this.elementRef.nativeElement
            );
        }

        if (this._config.autoFocus) {
            this.focusTrap.focusInitialElementWhenReady();
        }
    }

    private restoreFocus(): void {
        const toFocus = this.elementFocusedBeforeDialogWasOpened;

        // We need the extra check, because IE can set the `activeElement` to null in some cases.
        if (toFocus && typeof toFocus.focus === 'function') {
            toFocus.focus();
        }

        if (this.focusTrap) {
            this.focusTrap.destroy();
        }
    }
}
