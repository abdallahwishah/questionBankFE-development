import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedModule } from "../../../../../shared/components/dialog-shared/dialog-shared.module";
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DropdownFieldComponent } from "../../../../../shared/components/fields/dropdown-field/dropdown-field.component";

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
