import { Component,Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent extends AppComponentBase implements OnInit {
    checked:boolean = true;
    questionsType:any[] = [];
    type:any = 1;
  constructor(private _injector: Injector,
  ) { super(_injector);}


  ngOnInit() {
    this.questionsType = [
        {label:'اختيار من متعدد (خيار واحد)' , value :'1' },
        {label:'اختيار من متعدد (أكثر من خيار)' , value :'2' }
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
    this.type = $event?.value
  }

}
