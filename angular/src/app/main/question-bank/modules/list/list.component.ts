import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent extends AppComponentBase implements OnInit {
  filter: string;

  constructor(private _injector: Injector,
  ) { super(_injector);}

  ngOnInit() {
  }
  getQuestion(){

  }
  getList($event){

  }
  doActions(label: any, record: any) {
    switch (label) {
        case 'View':
           console.log()
            break;

        }
    }
}
