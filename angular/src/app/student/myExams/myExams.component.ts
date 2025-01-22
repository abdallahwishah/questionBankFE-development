import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@node_modules/@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-myExams',
  templateUrl: './myExams.component.html',
  styleUrls: ['./myExams.component.css']
})
export class MyExamsComponent extends AppComponentBase implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  filter: string;
  SessionId: any;
  expandedRows: any = {};

  constructor(
      private _injector: Injector,
      private _SessionsServiceProxy: SessionsServiceProxy,
      private _ActivatedRoute: ActivatedRoute,
      private _router: Router,
  ) {
      super(_injector);
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
      this._ActivatedRoute.paramMap?.subscribe((params) => {
          this.SessionId = Number(params?.get('id'));
          this.getList();
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
      this._SessionsServiceProxy
          .getMyExam( )
          .subscribe((result) => {
              this.primengTableHelper.totalRecordsCount = result.totalCount;
              this.primengTableHelper.records = result.items;
              this.primengTableHelper.hideLoadingIndicator();
          });
  }
  supervisorsAndStudents(item: any) {
      debugger
      this._router.navigate(['/app/main/sessions/supervisors-students', this.SessionId, item?.schoolClass?.id]);
  }
}
