import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { SubjectUnitsServiceProxy, CreateOrEditSubjectUnitDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';

@Component({
    selector: 'createOrEditSubjectUnitModal',
    templateUrl: './create-or-edit-subjectUnit-modal.component.html',
})
export class CreateOrEditSubjectUnitModalComponent extends AppComponentBase implements OnInit {
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    subjectUnit: CreateOrEditSubjectUnitDto = new CreateOrEditSubjectUnitDto();

    studyLevelValue = '';
    studySubjectValue = '';
    studyLevel: any;
    studySubject: any;
    Add_Unit = UniqueNameComponents.Add_Unit;
    constructor(
        injector: Injector,
        private _subjectUnitsServiceProxy: SubjectUnitsServiceProxy,
        private _dateTimeService: DateTimeService,
        private _dialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }
    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.show();
    }
    show(): void {
        this._dialogSharedService.SelectorFilterByComponent$(this.Add_Unit, 'configShow').subscribe((value) => {
            let subjectUnitId = value?.data?.id;
            if (!subjectUnitId) {
                this.subjectUnit = new CreateOrEditSubjectUnitDto();
                this.subjectUnit.id = subjectUnitId;
                this.studyLevel = undefined;
                this.studySubject = undefined;
                this.studyLevelValue = '';
                this.studySubjectValue = '';

                this.active = true;
            } else {
                this._subjectUnitsServiceProxy.getSubjectUnitForEdit(subjectUnitId).subscribe((result) => {
                    this.subjectUnit = result.subjectUnit;

                    this.studySubject = {
                        studySubject: {
                            name: result.studySubjectValue,
                            id: result.subjectUnit.studySubjectId,
                        },
                    };
                    this.studyLevel = this.subjectUnit.studyLevelIds.map((x, i) => {
                        return {
                            studyLevel: {
                                name: result.studyLevels?.split(',')?.[i],
                                id: x,
                            },
                        };
                    });
                    this.active = true;
                });
            }
        });
    }

    save(): void {
        this.saving = true;

        this.subjectUnit.studySubjectId = this.studySubject?.studySubject?.id;
        this._subjectUnitsServiceProxy
            .createOrEdit(this.subjectUnit)
            .pipe(
                finalize(() => {
                    this.saving = false;
                }),
            )
            .subscribe(() => {
                this._dialogSharedService.hideDialog(this.Add_Unit);
                this.notify.info(this.l('SavedSuccessfully'));
                this.modalSave.emit(null);
            });
    }
    close() {
        this._dialogSharedService.hideDialog(this.Add_Unit);
    }

    setStudyLevelIdNull() {
        this.studyLevelValue = '';
    }
    setStudySubjectIdNull() {
        this.subjectUnit.studySubjectId = null;
        this.studySubjectValue = '';
    }
    get studyLevelIds() {
        return this.studyLevel?.map((x) => x?.studyLevel?.id);
    }
    ngOnInit(): void {}
}
