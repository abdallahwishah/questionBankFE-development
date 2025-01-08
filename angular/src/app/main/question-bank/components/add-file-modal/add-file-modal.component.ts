import { Component, Injector, OnInit } from '@angular/core';
 import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-add-file-modal',
  standalone: true,
  imports: [DialogSharedModule, DropdownFieldComponent],
  templateUrl: './add-file-modal.component.html',
  styleUrl: './add-file-modal.component.css'
})
export class AddFileModalComponent extends AppComponentBase implements OnInit {
    Add_File_dialog = UniqueNameComponents.Add_File_dialog;
    saving = false;

    constructor(
        injector: Injector,
        private _DialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }
    ngOnInit(): void {
    }


    Save(){

    }


    closeDialog() {
        this._DialogSharedService.hideDialog(this.Add_File_dialog);
    }
}
