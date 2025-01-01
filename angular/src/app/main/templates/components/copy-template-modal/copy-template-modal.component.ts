import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { RouterModule } from '@node_modules/@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-copy-template-modal',
  standalone: true,
  imports: [DialogSharedModule , RouterModule],
  templateUrl: './copy-template-modal.component.html',
  styleUrl: './copy-template-modal.component.css'
})
export class CopyTemplateModalComponent extends AppComponentBase implements OnInit {
    Copy_Template_dialog = UniqueNameComponents.Copy_Template_dialog;
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
        this._DialogSharedService.hideDialog(this.Copy_Template_dialog);
    }
}

