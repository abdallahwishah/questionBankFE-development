import { ExamAttemptsServiceProxy } from './../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent } from '@node_modules/primeng/api';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.css']
})
export class AnswersComponent extends AppComponentBase implements OnInit {
    filter: string;
    SessionId:any;
      @ViewChild('dataTable', { static: true }) dataTable: Table;
          @ViewChild('paginator', { static: true }) paginator: Paginator;
    constructor(private _injector: Injector,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
        private _ActivatedRoute:ActivatedRoute,
    ) { super(_injector);}

  ngOnInit() {



    this._ActivatedRoute.paramMap.subscribe((params) => {
        this.SessionId = Number(params?.get('id')); //.get('product');
    });


  }



  getList(event?: LazyLoadEvent) {
          if (event) {
              if (this.primengTableHelper.shouldResetPaging(event)) {
                  this.paginator.changePage(0);
                  if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                      return;
                  }
              }
          }

          this.primengTableHelper.showLoadingIndicator();


          this._examAttemptsServiceProxy
              .getAllForCorrectionOrAudited(
                  undefined,
                  undefined,
                  this.SessionId,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  this.primengTableHelper.getSorting(this.dataTable),
                  this.primengTableHelper.getSkipCount(this.paginator, event),
                  this.primengTableHelper.getMaxResultCount(this.paginator, event),
              )
              .subscribe((result) => {
                  this.primengTableHelper.totalRecordsCount = result.totalCount;
                  this.primengTableHelper.records = result.items;
                  this.primengTableHelper.hideLoadingIndicator();
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
