import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { LazyLoadEvent } from 'primeng/api';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { SessionsServiceProxy, SessionStatusEnum } from '@shared/service-proxies/service-proxies';
import { Router } from '@node_modules/@angular/router';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class ListComponent extends AppComponentBase implements OnInit {
    Warning_dialog = UniqueNameComponents.Warning_dialog;

    filter: string;
      @ViewChild('dataTable', { static: true }) dataTable: Table;
      @ViewChild('paginator', { static: true }) paginator: Paginator;

          sessionStatusEnum = SessionStatusEnum;

    constructor(
        private _injector: Injector,
        private _router:Router,
        private _DialogSharedService: DialogSharedService,
        private _sessionsServiceProxy: SessionsServiceProxy,
    ) {
        super(_injector);
    }

    ngOnInit() {}
    getQuestion() {}
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

        this._sessionsServiceProxy
            .getAllForCorrectionOrAudited(
                this.filter,
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
           this._router.navigate(['/app/main/correcting/answers/',record?.session?.id]);
                console.log();
                break;

        }
    }

    addTemplate(){
        this._DialogSharedService.showDialog(this.Warning_dialog , {})
    }
}
