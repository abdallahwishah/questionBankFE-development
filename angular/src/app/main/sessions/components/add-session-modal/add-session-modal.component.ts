import { map, Subscription } from 'rxjs';
import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamTemplatesServiceProxy, SessionsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-sessions-modal',
    templateUrl: './add-session-modal.component.html',
    styleUrl: './add-session-modal.component.css',
})
export class AddSessionsModalComponent extends AppComponentBase implements OnInit {
    Add_Session_dialog = UniqueNameComponents.Add_Session_dialog;
    saving = false;

    @Output() OnRefresh: EventEmitter<boolean> = new EventEmitter<boolean>();

    subscription: Subscription;

   dataForEdit:any

 


    FormAddSession:FormGroup;

    ListExamTemplates:any[]=[];
    constructor(
        injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _fb:FormBuilder,
        private _ExamTemplatesServiceProxy:ExamTemplatesServiceProxy,
        private _SessionsServiceProxy:SessionsServiceProxy,
    ) {
        super(injector);
        this.FormAddSession=this._fb.group({
            id:[null],
            name:[null,Validators.required],
            startDate:[null,Validators.required],
            endDate:[null,Validators.required],
            examTemplateId:[null,Validators.required],
            supervisorFileToken:[null],
            studentFileToken:[null],
        })
    }
    ngOnInit(): void {
        this.subscription = this._DialogSharedService
        .SelectorFilterByComponent$(this.Add_Session_dialog, 'configShow')
        .subscribe(configShow => {
            if(configShow?.data){
                this.dataForEdit = configShow?.data
                this.FormAddSession.patchValue({...configShow?.data?.session ,
                    examTemplateId: 
                    {
                         name:configShow?.data?.examTemplateName ,
                         Id:configShow?.data?.session?.examTemplateId
                    },
                    startDate:new Date(configShow?.data?.session?.startDate),
                    endDate:new Date(configShow?.data?.session?.endDate),
                  })
               
            }else{
                this.FormAddSession.reset();
            }
           
        });

        

        this._ExamTemplatesServiceProxy.getAll(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        ).subscribe((res:any)=>{
            this.ListExamTemplates=res?.items.map((val:any)=>{
             return {
                Id:val?.examTemplate?.id,
                name:val?.examTemplate?.name,
             }
            });

        });



    }

    Save() {

        if(this.FormAddSession.valid){
           if(!this.dataForEdit){
            this._SessionsServiceProxy.createOrEdit(this.FormAddSession.value).subscribe(res=>{
                this.notify.success(this.l('SuccessfullySaved'));
                this.OnRefresh.emit();
                this.closeDialog();
               })
           }else{
            this._SessionsServiceProxy.createOrEdit({...this.FormAddSession.value , 
                examTemplateId:this.FormAddSession.get('examTemplateId')?.value?.Id
            }).subscribe(res=>{
                this.notify.success(this.l('SuccessfullyEdited'));

                this.OnRefresh.emit();
                this.closeDialog();
               })
           }
           
        }
        else{

        }

    }

    closeDialog() {
        this.FormAddSession.reset();
        this._DialogSharedService.hideDialog(this.Add_Session_dialog);
    }

    ngOnDestroy(): void {
        // Don’t forget to clean up
        this.subscription?.unsubscribe();
      }
}
