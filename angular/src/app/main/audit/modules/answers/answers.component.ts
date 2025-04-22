import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@node_modules/@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ExamAttemptsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-answers',
    templateUrl: './answers.component.html',
    styleUrls: ['./answers.component.css'],
})
export class AnswersComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    filter: string;
    SessionId: any;
    sessionName: any;

    constructor(
        private _injector: Injector,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
        private _ActivatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this._ActivatedRoute.paramMap.subscribe((params) => {
            this.SessionId = Number(params?.get('id')); //.get('product');
        });

        this.sessionName = this._ActivatedRoute.snapshot.queryParams['session'];
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
                undefined,

                undefined,
                undefined,
                undefined,
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

    doActions(label: any, record: any) {
        switch (label) {
            case 'ViewAnswersStudent':
                this._router.navigate(['/app/main/correcting/view/', record.examAttempt.id], {
                    queryParams: {
                        examTitle: record.examTitle,
                    },
                });
                break;
        }
    }
}
