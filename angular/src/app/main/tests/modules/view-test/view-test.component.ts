import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-view-test',
  templateUrl: './view-test.component.html',
  styleUrls: ['./view-test.component.css']
})
export class ViewTestComponent extends AppComponentBase implements OnInit {
    checked: boolean = true;
    questionsType: any[] = [];
    constructor(private _injector: Injector,
    ) { super(_injector); }

    ngOnInit() {
        this.questionsType = [
            {label:'اختيار من متعدد (خيار واحد)' , value :'1' },
            {label:'اختيار من متعدد (أكثر من خيار)' , value :'2' },
            {label:'صح أو خطأ' , value :'3' },
            {label:'توصيل' , value :'4' },
            {label:'اختيار من متعدد (خيار واحد)' , value :'5' },
            {label:'إعادة الترتيب' , value :'6' },
            {label:'سحب وإفلات إلى نص' , value :'7' },
            {label:'سحب وإفلات إلى جدول' , value :'8' },
        ]
      }

      getChecked($event){
        if(!$event.checked){
            this.checked = false
        }else{
            this.checked = true
        }
      }

      getQuestionType($event){
      /*   this.type = $event?.value */
      }
/*  */


isOpen = false;

toggleAccordion() {
  this.isOpen = !this.isOpen;
}
isOpenChlid = false;
isOpenChlid2 = false;
isOpenChlid3 = false;
isOpenChlid4 = false;
toggleChlidAccordion(type:any) {
    switch(type) {
        case 1: {
            this.isOpenChlid = !this.isOpenChlid;
           break;
        }
        case 2: {
            this.isOpenChlid2 = !this.isOpenChlid2;
           break;
        }
        case 3: {
            this.isOpenChlid3 = !this.isOpenChlid3;
           break;
        }
        default: {
            this.isOpenChlid4 = !this.isOpenChlid4;
           break;
        }
     }
}


}
