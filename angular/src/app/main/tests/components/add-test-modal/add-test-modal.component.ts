import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { AutoCompleteComponent } from '@app/shared/components/fields/auto-complete/auto-complete.component';
import { DateComponent } from '@app/shared/components/fields/date/date.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-add-test-modal',
  standalone: true,
  imports: [DropdownFieldComponent, DialogSharedModule, DateComponent, AutoCompleteComponent],
  templateUrl: './add-test-modal.component.html',
  styleUrl: './add-test-modal.component.css'
})
export class AddTestModalComponent  extends AppComponentBase implements OnInit {
    Add_Test_dialog = UniqueNameComponents.Add_Test_dialog;
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
        this._DialogSharedService.hideDialog(this.Add_Test_dialog);
    }
}
