/**
 * dialog.module
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { RI_DIALOG_SCROLL_STRATEGY_PROVIDER, RIDialogService } from './dialog.service';
import { RIDialogContainerComponent } from './dialog-container.component';

@NgModule({
    imports: [CommonModule, A11yModule, OverlayModule, PortalModule],
    exports: [],
    declarations: [
        RIDialogContainerComponent,
    ],
    providers: [
        RI_DIALOG_SCROLL_STRATEGY_PROVIDER,
        RIDialogService,
    ]
})
export class RIDialogModule {
}
