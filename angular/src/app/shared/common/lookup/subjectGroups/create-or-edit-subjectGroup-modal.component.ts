import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SubjectGroupsServiceProxy, CreateOrEditSubjectGroupDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { SubjectGroupStudySubjectLookupTableModalComponent } from './subjectGroup-studySubject-lookup-table-modal.component';
import { SubjectGroupSupportGroupLookupTableModalComponent } from './subjectGroup-supportGroup-lookup-table-modal.component';




@Component({
    selector: 'createOrEditSubjectGroupModal',
    templateUrl: './create-or-edit-subjectGroup-modal.component.html'
})
export class CreateOrEditSubjectGroupModalComponent extends AppComponentBase implements OnInit{

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('subjectGroupStudySubjectLookupTableModal', { static: true }) subjectGroupStudySubjectLookupTableModal: SubjectGroupStudySubjectLookupTableModalComponent;
    @ViewChild('subjectGroupSupportGroupLookupTableModal', { static: true }) subjectGroupSupportGroupLookupTableModal: SubjectGroupSupportGroupLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;


    subjectGroup: CreateOrEditSubjectGroupDto = new CreateOrEditSubjectGroupDto();

    studySubjectValue = '';
    supportGroupNameL = '';



    constructor(
        injector: Injector,
        private _subjectGroupsServiceProxy: SubjectGroupsServiceProxy,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    show(subjectGroupId?: number): void {


        if (!subjectGroupId) {
            this.subjectGroup = new CreateOrEditSubjectGroupDto();
            this.subjectGroup.id = subjectGroupId;
            this.studySubjectValue = '';
            this.supportGroupNameL = '';


            this.active = true;
            this.modal.show();
        } else {
            this._subjectGroupsServiceProxy.getSubjectGroupForEdit(subjectGroupId).subscribe(result => {
                this.subjectGroup = result.subjectGroup;

                this.studySubjectValue = result.studySubjectValue;
                this.supportGroupNameL = result.supportGroupName;


                this.active = true;
                this.modal.show();
            });
        }


    }

    save(): void {
            this.saving = true;



            this._subjectGroupsServiceProxy.createOrEdit(this.subjectGroup)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    openSelectStudySubjectModal() {
        this.subjectGroupStudySubjectLookupTableModal.id = this.subjectGroup.studySubjectId;
        this.subjectGroupStudySubjectLookupTableModal.displayName = this.studySubjectValue;
        this.subjectGroupStudySubjectLookupTableModal.show();
    }
    openSelectSupportGroupModal() {
        this.subjectGroupSupportGroupLookupTableModal.id = this.subjectGroup.supportGroupId;
        this.subjectGroupSupportGroupLookupTableModal.displayName = this.supportGroupNameL;
        this.subjectGroupSupportGroupLookupTableModal.show();
    }






    setStudySubjectIdNull() {
        this.subjectGroup.studySubjectId = null;
        this.studySubjectValue = '';
    }
    setSupportGroupIdNull() {
        this.subjectGroup.supportGroupId = null;
        this.supportGroupNameL = '';
    }


    getNewStudySubjectId() {
        this.subjectGroup.studySubjectId = this.subjectGroupStudySubjectLookupTableModal.id;
        this.studySubjectValue = this.subjectGroupStudySubjectLookupTableModal.displayName;
    }
    getNewSupportGroupId() {
        this.subjectGroup.supportGroupId = this.subjectGroupSupportGroupLookupTableModal.id;
        this.supportGroupNameL = this.subjectGroupSupportGroupLookupTableModal.displayName;
    }








    close(): void {
        this.active = false;
        this.modal.hide();
    }

     ngOnInit(): void {

     }
}
