import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { StudyLevelsServiceProxy, CreateOrEditStudyLevelDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    selector: 'createOrEditStudyLevelModal',
    templateUrl: './create-or-edit-studyLevel-modal.component.html',
})
export class CreateOrEditStudyLevelModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    isCreate: boolean = true;

    studyLevel: CreateOrEditStudyLevelDto = new CreateOrEditStudyLevelDto();

    constructor(
        injector: Injector,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _dateTimeService: DateTimeService,
    ) {
        super(injector);
    }

    show(studyLevelId?: number): void {
        if (!studyLevelId) {
            this.studyLevel = new CreateOrEditStudyLevelDto();
            this.isCreate = true;

            this.active = true;
            this.modal.show();
        } else {
            this.isCreate = false;
            this._studyLevelsServiceProxy.getStudyLevelForEdit(studyLevelId).subscribe((result) => {
                this.studyLevel = result.studyLevel;

                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
        this.saving = true;

        if (this.isCreate) {
            this._studyLevelsServiceProxy
                .create(this.studyLevel)
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
            this._studyLevelsServiceProxy
                .update(this.studyLevel)
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
        }
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    ngOnInit(): void {}
}
