import { SupervisorDto } from './../../../../../shared/service-proxies/service-proxies';
// schools.component.ts
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionsServiceProxy } from '@shared/service-proxies/service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Table } from '@node_modules/primeng/table';
import { Paginator } from '@node_modules/primeng/paginator';

interface SchoolClass {
    schoolClass: {
        name: string;
        id: number;
    };
    numberOfAttempt: number;
    numberOfSupervisor: number;
}

@Component({
    selector: 'app-schools',
    templateUrl: './schools.component.html',
    styleUrls: ['./schools.component.css'],
})
export class SchoolsComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    filter: string;
    SessionId: any;
    expandedRows: any = {};
    sessionName: any;
    constructor(
        private _injector: Injector,
        private _SessionsServiceProxy: SessionsServiceProxy,
        private _ActivatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        super(_injector);
    }

    ngOnInit(): void {
        this.sessionName = this._ActivatedRoute.snapshot.queryParams['session'];
    }

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
            .getAllSessionSchool(
                this.SessionId,
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
            )
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items?.map((item) => {
                    return {
                        ...item,
                    };
                });
                this.expandedRows = {};
                this.primengTableHelper.records.forEach((record) => {
                    if (record.school && record.school.id) {
                        this.expandedRows[record.school.id] = true;
                    }
                });
                this.primengTableHelper.hideLoadingIndicator();
            });
    }
    supervisorsAndStudents(item: any, school) {
        this._router.navigate(['/app/main/sessions/supervisors-students', this.SessionId, item?.schoolClass?.id], {
            queryParams: {
                school: item?.schoolName,
                schoolId: school?.school?.schoolId,
            },
        });
    }
}
