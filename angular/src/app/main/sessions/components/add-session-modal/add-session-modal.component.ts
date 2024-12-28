import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DropdownFieldComponent } from '../../../../shared/components/fields/dropdown-field/dropdown-field.component';
import { DialogSharedModule } from '../../../../shared/components/dialog-shared/dialog-shared.module';
import { DateComponent } from '../../../../shared/components/fields/date/date.component';
import { AutoCompleteComponent } from "../../../../shared/components/fields/auto-complete/auto-complete.component";

@Component({
    selector: 'app-add-sessions-modal',
    standalone: true,
    imports: [DropdownFieldComponent, DialogSharedModule, DateComponent, AutoCompleteComponent],
    templateUrl: './add-session-modal.component.html',
    styleUrl: './add-session-modal.component.css',
})
export class AddSessionsModalComponent extends AppComponentBase implements OnInit {
    Add_Session_dialog = UniqueNameComponents.Add_Session_dialog;
    saving = false;

    constructor(
        injector: Injector,
        private _DialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }
    ngOnInit(): void {}

    Save() {}

    closeDialog() {
        this._DialogSharedService.hideDialog(this.Add_Session_dialog);
    }
}
