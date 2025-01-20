import { ActivatedRoute } from '@angular/router';
import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-supervisors-students',
  templateUrl: './supervisors-students.component.html',
  styleUrls: ['./supervisors-students.component.css']
})
export class SupervisorsStudentsComponent extends AppComponentBase implements OnInit {
    filter: string;
    SessionId:any;

    constructor(private _injector: Injector,
        private _SessionsServiceProxy: SessionsServiceProxy,
        private _ActivatedRoute:ActivatedRoute,
    ) { super(_injector);}

  ngOnInit() {



    this._ActivatedRoute.paramMap?.subscribe((params) => {
        this.SessionId = Number(params?.get('id')); //.get('product');

        this.getList();
    });


  }



  getList() {
          this._SessionsServiceProxy
              .getAllSessionSchool(
                this.SessionId,
                  undefined,
                  undefined,
                  undefined,
              )
              .subscribe((result:any) => {
              });
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

