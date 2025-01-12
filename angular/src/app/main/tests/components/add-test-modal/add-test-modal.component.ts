import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { AutoCompleteComponent } from '@app/shared/components/fields/auto-complete/auto-complete.component';
import { DateComponent } from '@app/shared/components/fields/date/date.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ExamTemplatesServiceProxy } from '@shared/service-proxies/service-proxies';
import { SkeletonComponent } from "../../../../shared/components/skeleton/skeleton.component";

@Component({
  selector: 'app-add-test-modal',
  standalone: true,
  imports: [DropdownFieldComponent, DialogSharedModule, DateComponent, AutoCompleteComponent, SkeletonComponent],
  templateUrl: './add-test-modal.component.html',
  styleUrl: './add-test-modal.component.css'
})
export class AddTestModalComponent  extends AppComponentBase implements OnInit {
    Add_Test_dialog = UniqueNameComponents.Add_Test_dialog;
    saving = false;
    examTemplates:any;
    constructor(
        injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _examTemplatesServiceProxy: ExamTemplatesServiceProxy,

    ) {
        super(injector);
    }
    ngOnInit(): void {
        this._examTemplatesServiceProxy
        .getAll(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
        ).subscribe((result:any) => {
            this.examTemplates = result.items.map((item) => ({
                id: item.examTemplate.id,
                name: item.examTemplate.name,
            }));

        });

    }

    Save() {}

    closeDialog() {
        this._DialogSharedService.hideDialog(this.Add_Test_dialog);
    }
}
