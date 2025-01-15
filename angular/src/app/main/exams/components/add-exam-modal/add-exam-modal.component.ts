import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ExamTemplatesServiceProxy } from '@shared/service-proxies/service-proxies';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { FormsModule } from '@node_modules/@angular/forms';

@Component({
    selector: 'app-add-exam-modal',
    standalone: true,
    imports: [DropdownFieldComponent, DialogSharedModule, SkeletonComponent, FormsModule],
    templateUrl: './add-exam-modal.component.html',
    styleUrl: './add-exam-modal.component.css',
})
export class AddExamModalComponent extends AppComponentBase implements OnInit {
    Add_Test_dialog = UniqueNameComponents.Add_Test_dialog;
    saving = false;
    examTemplates: any;
    templateId: any;
    constructor(
        injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _examTemplatesServiceProxy: ExamTemplatesServiceProxy,
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this._examTemplatesServiceProxy
            .getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)
            .subscribe((result: any) => {
                this.examTemplates = result.items.map((item) => ({
                    id: item.examTemplate.id,
                    name: item.examTemplate.name,
                }));
            });
    }

    Save() {
        this._examTemplatesServiceProxy.generateExamByTemplate(this.templateId).subscribe(() => {
            this.notify.info(this.l('SavedSuccessfully'));
            this.closeDialog();
        });
    }

    closeDialog() {
        this._DialogSharedService.hideDialog(this.Add_Test_dialog);
    }
}
