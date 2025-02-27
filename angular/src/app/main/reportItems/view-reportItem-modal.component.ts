import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetReportItemForViewDto, ReportItemDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewReportItemModal',
    templateUrl: './view-reportItem-modal.component.html'
})
export class ViewReportItemModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetReportItemForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetReportItemForViewDto();
        this.item.reportItem = new ReportItemDto();
    }

    show(item: GetReportItemForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }



    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
