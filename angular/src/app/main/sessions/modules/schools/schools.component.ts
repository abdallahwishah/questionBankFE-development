import {
    GetSessionForViewDto,
    SessionStatusEnum,
    StopSessionDto,
    SupervisorDto,
} from './../../../../../shared/service-proxies/service-proxies';
// schools.component.ts
import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionsServiceProxy } from '@shared/service-proxies/service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Table } from '@node_modules/primeng/table';
import { Paginator } from '@node_modules/primeng/paginator';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';

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
    governorateIdFilter: any;
    schoolId;
    schoolClassId;
    statusId: any;
    sessionStatusEnum = SessionStatusEnum;
    session: GetSessionForViewDto | any;

    constructor(
        private _injector: Injector,
        private _SessionsServiceProxy: SessionsServiceProxy,
        private _ActivatedRoute: ActivatedRoute,
        private _router: Router,
        private _DialogSharedService: DialogSharedService,
        private _sessionsServiceProxy: SessionsServiceProxy,
        private cdr: ChangeDetectorRef,
    ) {
        super(_injector);
    }

    ngOnInit(): void {
        this.sessionName = this._ActivatedRoute.snapshot.queryParams['session'];
    }
    public isStudentLevelCardCollapsed = true; // Start collapsed by default
    toggleStudentLevelCard(): void {
        this.isStudentLevelCardCollapsed = !this.isStudentLevelCardCollapsed;
    }
    ngAfterViewInit() {
        this._ActivatedRoute.paramMap?.subscribe((params) => {
            this.SessionId = Number(params?.get('id'));
            this._sessionsServiceProxy?.getSessionForView(this.SessionId).subscribe((value) => {
                this.session = {
                    ...value,
                    asBranch: [
                        ...Object.entries(value?.studentCountBasedOnLevel).map(([key, value]) => ({ key, value })),
                    ],
                };
            });
            this.cdr.detectChanges();
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
                this.filter,
                this.SessionId,
                this.governorateIdFilter?.governorate?.id,
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
        this._router.navigate(['../../supervisors-students', this.SessionId, item?.schoolClass?.id], {
            queryParams: {
                school: item?.schoolName,
                schoolId: school?.school?.id,
            },
            queryParamsHandling: 'merge',
            relativeTo: this._ActivatedRoute,
        });
    }
    @ViewChild(FiltersComponent) FiltersComponent: FiltersComponent;

    closeFilters() {
        this.FiltersComponent.isPanelOpen = false;
    }
    clearFilter() {
        this.FiltersComponent.isPanelOpen = false;
        this.governorateIdFilter = undefined;
    }
    doActions(label: any, record: any) {
        this.schoolId = record?.school?.id;
        this.schoolClassId = undefined;
        switch (label) {
            case 'Stop':
                this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
                    if (isConfirmed) {
                        this._sessionsServiceProxy
                            .stopSession(
                                new StopSessionDto({
                                    schoolClassId: undefined,
                                    schoolId: this.schoolId,
                                    sessionId: this.SessionId,
                                    studentId: undefined,
                                }),
                            )
                            .subscribe((res) => {
                                this.getList();
                            });
                    }
                });
                break;
            case 'Extend':
                this._DialogSharedService.showDialog(UniqueNameComponents.extendTimeSession_dialog, {});
                break;
        }
    }
    doActionsClass(label: any, record: any, school) {
        this.schoolId = school?.school?.id;
        this.schoolClassId = record?.schoolClass?.id;
        switch (label) {
            case 'View':
                this.supervisorsAndStudents(record, school);
                break;
            case 'Stop':
                this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
                    if (isConfirmed) {
                        this._sessionsServiceProxy
                            .stopSession(
                                new StopSessionDto({
                                    schoolClassId: this.schoolClassId,
                                    schoolId: school?.school?.id,
                                    sessionId: this.SessionId,
                                    studentId: undefined,
                                }),
                            )
                            .subscribe((res) => {
                                this.getList();
                            });
                    }
                });
                break;
            case 'Extend':
                this._DialogSharedService.showDialog(UniqueNameComponents.extendTimeSession_dialog, {});
                break;
        }
    }
}
