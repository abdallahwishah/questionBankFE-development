import { ActivatedRoute } from '@angular/router';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionsServiceProxy } from '@shared/service-proxies/service-proxies';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { LazyLoadEvent } from '@node_modules/primeng/api';

@Component({
    selector: 'app-supervisors-students',
    templateUrl: './supervisors-students.component.html',
    styleUrls: ['./supervisors-students.component.css'],
})
export class SupervisorsStudentsComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    filter: string;
    SessionId: any;

    constructor(
        private _injector: Injector,
        private _SessionsServiceProxy: SessionsServiceProxy,
        private _ActivatedRoute: ActivatedRoute,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this._ActivatedRoute.paramMap?.subscribe((params) => {
            this.SessionId = Number(params?.get('id')); //.get('product');

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
                .getAllSessionSchool(this.SessionId, undefined, undefined, undefined)
                .subscribe((result) => {
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    this.primengTableHelper.records = result.items;
                    this.primengTableHelper.hideLoadingIndicator();
                });
        }

    getAnswers() {}
    doActions(label: any, record: any) {
        switch (label) {
            case 'View':
                console.log();
                break;
        }
    }
}
