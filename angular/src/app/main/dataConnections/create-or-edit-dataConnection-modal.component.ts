import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { DataConnectionsServiceProxy, CreateOrEditDataConnectionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';



@Component({
    selector: 'createOrEditDataConnectionModal',
    templateUrl: './create-or-edit-dataConnection-modal.component.html'
})
export class CreateOrEditDataConnectionModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    dataConnection: CreateOrEditDataConnectionDto = new CreateOrEditDataConnectionDto();




    constructor(
        injector: Injector,
        private _dataConnectionsServiceProxy: DataConnectionsServiceProxy,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }
    
    show(dataConnectionId?: number): void {
    

        if (!dataConnectionId) {
            this.dataConnection = new CreateOrEditDataConnectionDto();
            this.dataConnection.id = dataConnectionId;


            this.active = true;
            this.modal.show();
        } else {
            this._dataConnectionsServiceProxy.getDataConnectionForEdit(dataConnectionId).subscribe(result => {
                this.dataConnection = result.dataConnection;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._dataConnectionsServiceProxy.createOrEdit(this.dataConnection)
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
