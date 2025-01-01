import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { FormsModule } from '@node_modules/@angular/forms';
import { RouterModule } from '@node_modules/@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-add-class-modal',
  standalone: true,
  imports: [DialogSharedModule , RouterModule , InputSwitchModule , FormsModule],
  templateUrl: './add-class-modal.component.html',
  styleUrl: './add-class-modal.component.css'
})
export class AddClassModalComponent extends AppComponentBase implements OnInit {
    Add_Class_dialog = UniqueNameComponents.Add_Class_dialog;
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
        this._DialogSharedService.hideDialog(this.Add_Class_dialog);
    }
}
