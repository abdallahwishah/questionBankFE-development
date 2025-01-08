import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSubjectUnitForViewDto, SubjectUnitDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSubjectUnitModal',
    templateUrl: './view-subjectUnit-modal.component.html'
})
export class ViewSubjectUnitModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSubjectUnitForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSubjectUnitForViewDto();
        this.item.subjectUnit = new SubjectUnitDto();
    }

    show(item: GetSubjectUnitForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
