import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SupportGroupItemsServiceProxy, CreateOrEditSupportGroupItemDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { SupportGroupItemSupportGroupLookupTableModalComponent } from './supportGroupItem-supportGroup-lookup-table-modal.component';




@Component({
    selector: 'createOrEditSupportGroupItemModal',
    templateUrl: './create-or-edit-supportGroupItem-modal.component.html'
})
export class CreateOrEditSupportGroupItemModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('supportGroupItemSupportGroupLookupTableModal', { static: true }) supportGroupItemSupportGroupLookupTableModal: SupportGroupItemSupportGroupLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    

    supportGroupItem: CreateOrEditSupportGroupItemDto = new CreateOrEditSupportGroupItemDto();

    supportGroupNameL = '';



    constructor(
        injector: Injector,
        private _supportGroupItemsServiceProxy: SupportGroupItemsServiceProxy,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }
    
    show(supportGroupItemId?: number): void {
    

        if (!supportGroupItemId) {
            this.supportGroupItem = new CreateOrEditSupportGroupItemDto();
            this.supportGroupItem.id = supportGroupItemId;
            this.supportGroupNameL = '';


            this.active = true;
            this.modal.show();
        } else {
            this._supportGroupItemsServiceProxy.getSupportGroupItemForEdit(supportGroupItemId).subscribe(result => {
                this.supportGroupItem = result.supportGroupItem;

                this.supportGroupNameL = result.supportGroupNameL;


                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._supportGroupItemsServiceProxy.createOrEdit(this.supportGroupItem)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    openSelectSupportGroupModal() {
        this.supportGroupItemSupportGroupLookupTableModal.id = this.supportGroupItem.supportGroupId;
        this.supportGroupItemSupportGroupLookupTableModal.displayName = this.supportGroupNameL;
        this.supportGroupItemSupportGroupLookupTableModal.show();
    }






    setSupportGroupIdNull() {
        this.supportGroupItem.supportGroupId = null;
        this.supportGroupNameL = '';
    }


    getNewSupportGroupId() {
        this.supportGroupItem.supportGroupId = this.supportGroupItemSupportGroupLookupTableModal.id;
        this.supportGroupNameL = this.supportGroupItemSupportGroupLookupTableModal.displayName;
    }








    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        
     }    
}
