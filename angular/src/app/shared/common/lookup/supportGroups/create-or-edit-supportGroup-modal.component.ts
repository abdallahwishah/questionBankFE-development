import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SupportGroupsServiceProxy, CreateOrEditSupportGroupDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';




@Component({
    selector: 'createOrEditSupportGroupModal',
    templateUrl: './create-or-edit-supportGroup-modal.component.html'
})
export class CreateOrEditSupportGroupModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    

    supportGroup: CreateOrEditSupportGroupDto = new CreateOrEditSupportGroupDto();




    constructor(
        injector: Injector,
        private _supportGroupsServiceProxy: SupportGroupsServiceProxy,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }
    
    show(supportGroupId?: number): void {
    

        if (!supportGroupId) {
            this.supportGroup = new CreateOrEditSupportGroupDto();
            this.supportGroup.id = supportGroupId;


            this.active = true;
            this.modal.show();
        } else {
            this._supportGroupsServiceProxy.getSupportGroupForEdit(supportGroupId).subscribe(result => {
                this.supportGroup = result.supportGroup;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._supportGroupsServiceProxy.createOrEdit(this.supportGroup)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

















    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        
     }    
}
