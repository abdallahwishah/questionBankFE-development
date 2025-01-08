import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetComplexityForViewDto, ComplexityDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewComplexityModal',
    templateUrl: './view-complexity-modal.component.html'
})
export class ViewComplexityModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetComplexityForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetComplexityForViewDto();
        this.item.complexity = new ComplexityDto();
    }

    show(item: GetComplexityForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }
    
    

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
