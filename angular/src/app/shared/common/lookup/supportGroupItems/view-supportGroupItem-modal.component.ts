import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSupportGroupItemForViewDto, SupportGroupItemDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSupportGroupItemModal',
    templateUrl: './view-supportGroupItem-modal.component.html'
})
export class ViewSupportGroupItemModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSupportGroupItemForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSupportGroupItemForViewDto();
        this.item.supportGroupItem = new SupportGroupItemDto();
    }

    show(item: GetSupportGroupItemForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
