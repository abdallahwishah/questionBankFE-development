import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SubjectUnitsServiceProxy, CreateOrEditSubjectUnitDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { SubjectUnitStudyLevelLookupTableModalComponent } from './subjectUnit-studyLevel-lookup-table-modal.component';
import { SubjectUnitStudySubjectLookupTableModalComponent } from './subjectUnit-studySubject-lookup-table-modal.component';




@Component({
    selector: 'createOrEditSubjectUnitModal',
    templateUrl: './create-or-edit-subjectUnit-modal.component.html'
})
export class CreateOrEditSubjectUnitModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('subjectUnitStudyLevelLookupTableModal', { static: true }) subjectUnitStudyLevelLookupTableModal: SubjectUnitStudyLevelLookupTableModalComponent;
    @ViewChild('subjectUnitStudySubjectLookupTableModal', { static: true }) subjectUnitStudySubjectLookupTableModal: SubjectUnitStudySubjectLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    

    subjectUnit: CreateOrEditSubjectUnitDto = new CreateOrEditSubjectUnitDto();

    studyLevelValue = '';
    studySubjectValue = '';



    constructor(
        injector: Injector,
        private _subjectUnitsServiceProxy: SubjectUnitsServiceProxy,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }
    
    show(subjectUnitId?: number): void {
    

        if (!subjectUnitId) {
            this.subjectUnit = new CreateOrEditSubjectUnitDto();
            this.subjectUnit.id = subjectUnitId;
            this.studyLevelValue = '';
            this.studySubjectValue = '';


            this.active = true;
            this.modal.show();
        } else {
            this._subjectUnitsServiceProxy.getSubjectUnitForEdit(subjectUnitId).subscribe(result => {
                this.subjectUnit = result.subjectUnit;

                this.studyLevelValue = result.studyLevelValue;
                this.studySubjectValue = result.studySubjectValue;


                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._subjectUnitsServiceProxy.createOrEdit(this.subjectUnit)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    openSelectStudyLevelModal() {
        this.subjectUnitStudyLevelLookupTableModal.id = this.subjectUnit.studyLevelId;
        this.subjectUnitStudyLevelLookupTableModal.displayName = this.studyLevelValue;
        this.subjectUnitStudyLevelLookupTableModal.show();
    }
    openSelectStudySubjectModal() {
        this.subjectUnitStudySubjectLookupTableModal.id = this.subjectUnit.studySubjectId;
        this.subjectUnitStudySubjectLookupTableModal.displayName = this.studySubjectValue;
        this.subjectUnitStudySubjectLookupTableModal.show();
    }






    setStudyLevelIdNull() {
        this.subjectUnit.studyLevelId = null;
        this.studyLevelValue = '';
    }
    setStudySubjectIdNull() {
        this.subjectUnit.studySubjectId = null;
        this.studySubjectValue = '';
    }


    getNewStudyLevelId() {
        this.subjectUnit.studyLevelId = this.subjectUnitStudyLevelLookupTableModal.id;
        this.studyLevelValue = this.subjectUnitStudyLevelLookupTableModal.displayName;
    }
    getNewStudySubjectId() {
        this.subjectUnit.studySubjectId = this.subjectUnitStudySubjectLookupTableModal.id;
        this.studySubjectValue = this.subjectUnitStudySubjectLookupTableModal.displayName;
    }








    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        
     }    
}
