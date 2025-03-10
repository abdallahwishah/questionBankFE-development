import { DateTimeService } from './../../../../shared/common/timing/date-time.service';
import {
    SessionsServiceProxy,
    SessionStatusEnum,
    StopSessionDto,
} from './../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { DateTime } from '@node_modules/@types/luxon';

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
    studyLevel;
    filter: string;
    studySubject;
    fromDate: any;
    toDate: any;


    constructor(
        private _injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _sessionsServiceProxy: SessionsServiceProxy,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private DateTimeService: DateTimeService,
    ) {
        super(_injector);
    }
    skipCount = 0;
    ngOnInit() {
        /* Covert Enum To array */
        this.sessionStatus = Object.keys(SessionStatusEnum)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                name: key,
                id: SessionStatusEnum[key as keyof typeof SessionStatusEnum],
            }));
        this.sessionStatus.unshift({ name: 'All', id: undefined });
    }

    formatDate(date){
        const dateObj = new Date(date);
        const  day = String(dateObj.getDate()).padStart(2, '0');       // 26
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 03
        const  year = String(dateObj.getFullYear()).slice(-2);          // 25
        return `${day}/${month}/${year}` ; // 26/03/25
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
        this.skipCount = this.primengTableHelper.getSkipCount(this.paginator, event);
        this.primengTableHelper.showLoadingIndicator();
        const luxonDateTime = this.formatDate(this.toDate);

        this._sessionsServiceProxy
            .getAll(
                this.filter,
                this.toDate ? this.DateTimeService.fromJSDate(this.toDate) : undefined,
                this.fromDate ? this.DateTimeService.fromJSDate(this.fromDate) : undefined,
                undefined,
                this.studyLevel?.studyLevel?.id,
                this.studySubject?.studySubject?.id,
                this.isStatusFilter,
                undefined,
                undefined,
                this.primengTableHelper.getSorting(this.dataTable),
                this.skipCount,
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
    AddSession(data?: any) {
        this._DialogSharedService.showDialog(this.Add_Session_dialog, data);
    }
    sessionId: any;
    doActions(label: any, record: any) {
        switch (label) {
            case 'ViewSchools':
                this._router.navigate(['schools', record?.session?.id], {
                    queryParams: {
                        session: record?.session.name,
                    },
                    relativeTo: this._activatedRoute,
                });
                break;
            case 'Edit':
                this.AddSession(record);
                break;
            case 'Export':
                this._DialogSharedService.showDialog(UniqueNameComponents.Export_By_Level_dialog, {
                    sessionId: record?.session?.id,
                });
                break;

            case 'Delete':
                this.sessionStatusEnum.Finished
                 console.log("record" , record.session.status)
                this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
                    if (isConfirmed) {
                        this._sessionsServiceProxy.delete(record?.session?.id).subscribe((res) => {
                            this.getList();
                        });
                    }
                });
                break;
            case 'Stop':
                this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
                    if (isConfirmed) {
                        this._sessionsServiceProxy
                            .stopSession(
                                new StopSessionDto({
                                    schoolClassId: undefined,
                                    schoolId: undefined,
                                    sessionId: record?.session?.id,
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
                this.sessionId = record?.session?.id;
                this._DialogSharedService.showDialog(UniqueNameComponents.extendTimeSession_dialog, {});
                break;
        }
    }
    @ViewChild(FiltersComponent) FiltersComponent: FiltersComponent;

    closeFilters() {
        this.FiltersComponent.isPanelOpen = false;
    }
    clearFilter() {
        this.filter = '';
        this.toDate = undefined;
        this.fromDate = undefined;
        this.studyLevel = undefined;
        this.studySubject = undefined;
        this.getList();
        this.FiltersComponent.isPanelOpen = false;
    }
    get studyLevelIds() {
        return [this.studyLevel?.studyLevel?.id];
    }
}
