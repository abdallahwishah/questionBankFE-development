import { DialogSharedService } from './../../../components/dialog-shared/dialog-shared.service';
import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { StudySubjectsServiceProxy, CreateOrEditStudySubjectDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { NgForm } from '@node_modules/@angular/forms';

@Component({
    selector: 'createOrEditStudySubjectModal',
    templateUrl: './create-or-edit-studySubject-modal.component.html',
})
export class CreateOrEditStudySubjectModalComponent extends AppComponentBase implements OnInit {
    Add_Study_Subject_dialog = UniqueNameComponents.Add_Study_Subject_dialog;
    @ViewChild('studySubjectForm') studySubjectForm: NgForm;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    studyLevelsValue: any[] = [];
    active = false;
    saving = false;
    isCreate: boolean = true;

    studySubject: CreateOrEditStudySubjectDto = new CreateOrEditStudySubjectDto();

    constructor(
        injector: Injector,
        private _studySubjectsServiceProxy: StudySubjectsServiceProxy,
        private _dateTimeService: DateTimeService,
        private dialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }

    show(studySubjectId?: number): void {
        if (!studySubjectId) {
            this.studySubject = new CreateOrEditStudySubjectDto();
            this.isCreate = true;
            this.studyLevelsValue = [];

            this.active = true;
            this.dialogSharedService.showDialog(this.Add_Study_Subject_dialog, {});
        } else {
            this.isCreate = false;
            this._studySubjectsServiceProxy.getStudySubjectForEdit(studySubjectId).subscribe((result) => {
                this.studySubject = result.studySubject;
                this.studyLevelsValue = this.studySubject.studyLevelIds.map((x, i) => {
                    return {
                        studyLevel: {
                            name: result.studyLevels?.split(',')?.[i],
                            id: x,
                        },
                    };
                });
                this.active = true;
                this.dialogSharedService.showDialog(this.Add_Study_Subject_dialog, {});
            });
        }
    }

    save(): void {
        this.saving = true;

        this.studySubject.studyLevelIds = this.studyLevelsValue.map((x) => x?.studyLevel?.id);
        this.studySubjectForm.form.markAllAsTouched();

        if (this.isCreate && this.studySubjectForm.form.valid) {
            this._studySubjectsServiceProxy
                .create(this.studySubject)
                .pipe(
                    finalize(() => {
                        this.saving = false;
                    }),
                )
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else if (!this.isCreate && this.studySubjectForm.form.valid) {
            this._studySubjectsServiceProxy
                .update(this.studySubject)
                .pipe(
                    finalize(() => {
                        this.saving = false;
                    }),
                )
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this.saving = false;
        }
    }

    close(): void {
        this.active = false;
        this.dialogSharedService.hideDialog(this.Add_Study_Subject_dialog, {});
    }

    ngOnInit(): void {}
}
