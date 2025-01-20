
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionsServiceProxy } from '@shared/service-proxies/service-proxies';
import { ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';


@Component({
  selector: 'app-schools',
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.css']
})
export class SchoolsComponent extends AppComponentBase implements OnInit {
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
                  console.log("primengTableHelper",result)
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
