import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { FormsModule } from '@node_modules/@angular/forms';
import { RouterModule } from '@node_modules/@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';

@Component({
  selector: 'app-add-subject-modal',
  standalone: true,
  imports: [DialogSharedModule , RouterModule , InputSwitchModule , FormsModule , DropdownFieldComponent],
  templateUrl: './add-subject-modal.component.html',
  styleUrl: './add-subject-modal.component.css'
})
export class AddSubjectModalComponent extends AppComponentBase implements OnInit {
    Add_Subject_dialog = UniqueNameComponents.Add_Subject_dialog;
    checked:boolean = true
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
        this._DialogSharedService.hideDialog(this.Add_Subject_dialog);
    }
}
