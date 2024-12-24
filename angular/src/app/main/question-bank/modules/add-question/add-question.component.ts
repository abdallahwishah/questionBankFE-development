import { Component,Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent extends AppComponentBase implements OnInit {
    checked:boolean = true
  constructor(private _injector: Injector,
  ) { super(_injector);}


  ngOnInit() {
  }

}
