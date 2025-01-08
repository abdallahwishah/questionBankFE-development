import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { CategoriesServiceProxy, CreateOrEditCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';




@Component({
    selector: 'createOrEditCategoryModal',
    templateUrl: './create-or-edit-category-modal.component.html'
})
export class CreateOrEditCategoryModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    

    category: CreateOrEditCategoryDto = new CreateOrEditCategoryDto();




    constructor(
        injector: Injector,
        private _categoriesServiceProxy: CategoriesServiceProxy,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }
    
    show(categoryId?: number): void {
    

        if (!categoryId) {
            this.category = new CreateOrEditCategoryDto();
            this.category.id = categoryId;


            this.active = true;
            this.modal.show();
        } else {
            this._categoriesServiceProxy.getCategoryForEdit(categoryId).subscribe(result => {
                this.category = result.category;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._categoriesServiceProxy.createOrEdit(this.category)
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
