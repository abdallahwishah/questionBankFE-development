import {
    QuestionsServiceProxy,
    ExamsServiceProxy,
    ImportQuestionInput,
} from './../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit } from '@angular/core';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { QuestionTypeEnum } from '@shared/service-proxies/service-proxies';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { UploaderService } from '@app/shared/services/uploader.service';

@Component({
    selector: 'app-add-file-modal',
    standalone: true,
    imports: [DialogSharedModule, DropdownFieldComponent, AppSharedModule, SkeletonComponent],
    templateUrl: './add-file-modal.component.html',
    styleUrl: './add-file-modal.component.css',
})
export class AddFileModalComponent extends AppComponentBase implements OnInit {
    Add_File_dialog = UniqueNameComponents.Add_File_dialog;
    saving = false;
    QuestionTypeEnum = QuestionTypeEnum;
    QuestionTypeId = undefined;
    uploadedFile: any;
    fileStudentToken: any;
    constructor(
        injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _uploaderService: UploaderService,
        private _examsServiceProxy: ExamsServiceProxy,
    ) {
        super(injector);
    }
    ngOnInit(): void {}

    upload(file) {
        this.uploadedFile = file?.target?.files[0];
        this._uploaderService.uploadFileOrFiles(this.uploadedFile).subscribe((value: any) => {
            this.fileStudentToken = value?.result?.fileToken;
        });
    }
    Save() {
        this._examsServiceProxy
            .importQuestionsFromExcel(
                new ImportQuestionInput({
                    fileToken: this.fileStudentToken,
                }),
            )
            .subscribe((value) => {
                // clear
                this.uploadedFile = undefined;
                this.fileStudentToken = undefined;

                this.closeDialog();
            });
    }

    closeDialog() {
        this._DialogSharedService.hideDialog(this.Add_File_dialog);
    }
}
