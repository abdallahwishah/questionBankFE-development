import { SessionsServiceProxy, SessionStatusEnum } from './../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { Router } from '@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class ListComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    sessionStatus: any[] = [];
    isStatusFilter: any;
    sessionStatusEnum = SessionStatusEnum;
    Add_Session_dialog = UniqueNameComponents.Add_Session_dialog;

    filter: string;

    constructor(
        private _injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _sessionsServiceProxy: SessionsServiceProxy,
        private _router: Router,
    ) {
        super(_injector);
    }

    ngOnInit() {
        /* Covert Enum To array */
        this.sessionStatus = Object.keys(SessionStatusEnum)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                name: key,
                id: SessionStatusEnum[key as keyof typeof SessionStatusEnum],
            }));
            this.sessionStatus.unshift({name:"All",id:undefined});

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

        this._sessionsServiceProxy
            .getAll(
                this.filter,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.isStatusFilter,
                undefined,
                undefined,
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
            )
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                this.isStatusFilter = undefined;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    cleaerStatusFilter() {}
    AddSession() {
        this._DialogSharedService.showDialog(this.Add_Session_dialog, {});
    }
    doActions(label: any, record: any) {
        switch (label) {
            case 'ViewSchools':
                this._router.navigate(['/app/main/sessions/schools/', record?.session?.id], {
                    queryParams: {
                        session: record?.session.name,
                    },
                });
                break;
            case 'Delete':
                this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
                    if (isConfirmed) {
                        this._sessionsServiceProxy.delete(record?.session?.id).subscribe((res) => {
                            this.getList();
                        });
                    }
                });
                break;
        }
    }
}
