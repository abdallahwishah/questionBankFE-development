import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { RouterModule } from '@node_modules/@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-warning-modal',
    standalone: true,
    imports: [DialogSharedModule, RouterModule],
    templateUrl: './warning-modal.component.html',
    styleUrl: './warning-modal.component.css',
})
export class WarningModalComponent extends AppComponentBase implements OnInit {
    Warning_dialog = UniqueNameComponents.Warning_dialog;
    saving = false;

    constructor(
        injector: Injector,
        private _DialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }
    ngOnInit(): void {}

    Save() {
        this._DialogSharedService?.dataDialog?.[this.Warning_dialog]?.configShow?.data?.confirm();
        this._DialogSharedService.hideDialog(this.Warning_dialog);

    }

    closeDialog() {
        this._DialogSharedService.hideDialog(this.Warning_dialog);
    }
}
