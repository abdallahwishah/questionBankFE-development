﻿import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetGovernorateForViewDto, GovernorateDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewGovernorateModal',
    templateUrl: './view-governorate-modal.component.html'
})
export class ViewGovernorateModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetGovernorateForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetGovernorateForViewDto();
        this.item.governorate = new GovernorateDto();
    }

    show(item: GetGovernorateForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
