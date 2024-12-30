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
}
