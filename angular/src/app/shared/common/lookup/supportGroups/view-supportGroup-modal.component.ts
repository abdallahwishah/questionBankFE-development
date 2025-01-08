import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSupportGroupForViewDto, SupportGroupDto , SupportGroupTypeEnum} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSupportGroupModal',
    templateUrl: './view-supportGroup-modal.component.html'
})
export class ViewSupportGroupModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSupportGroupForViewDto;
    supportGroupTypeEnum = SupportGroupTypeEnum;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSupportGroupForViewDto();
        this.item.supportGroup = new SupportGroupDto();
    }

    show(item: GetSupportGroupForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
