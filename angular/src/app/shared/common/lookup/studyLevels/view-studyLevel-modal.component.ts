import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetStudyLevelForViewDto, StudyLevelDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewStudyLevelModal',
    templateUrl: './view-studyLevel-modal.component.html'
})
export class ViewStudyLevelModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetStudyLevelForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetStudyLevelForViewDto();
        this.item.studyLevel = new StudyLevelDto();
    }

    show(item: GetStudyLevelForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
