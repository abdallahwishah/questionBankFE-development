import { ExamAttemptsServiceProxy } from './../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.css']
})
export class AnswersComponent extends AppComponentBase implements OnInit {
    filter: string;

    constructor(private _injector: Injector,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy
    ) { super(_injector);}

  ngOnInit() {
    // this._examAttemptsServiceProxy.getAll()
  }

  getList($event){

  }
  getAnswers(){

  }
  doActions(label: any, record: any) {
    switch (label) {
        case 'View':
           console.log()
            break;

        }
    }

}
