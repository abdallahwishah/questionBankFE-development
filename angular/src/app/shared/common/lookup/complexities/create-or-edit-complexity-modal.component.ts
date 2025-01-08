import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { ComplexitiesServiceProxy, CreateOrEditComplexityDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';




@Component({
    selector: 'createOrEditComplexityModal',
    templateUrl: './create-or-edit-complexity-modal.component.html'
})
export class CreateOrEditComplexityModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    

    complexity: CreateOrEditComplexityDto = new CreateOrEditComplexityDto();




    constructor(
        injector: Injector,
        private _complexitiesServiceProxy: ComplexitiesServiceProxy,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }
    
    show(complexityId?: number): void {
    

        if (!complexityId) {
            this.complexity = new CreateOrEditComplexityDto();
            this.complexity.id = complexityId;


            this.active = true;
            this.modal.show();
        } else {
            this._complexitiesServiceProxy.getComplexityForEdit(complexityId).subscribe(result => {
                this.complexity = result.complexity;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._complexitiesServiceProxy.createOrEdit(this.complexity)
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
