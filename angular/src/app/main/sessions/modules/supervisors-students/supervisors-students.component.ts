import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { ActivatedRoute } from '@angular/router';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ExamAttemptsServiceProxy,
    SessionsServiceProxy,
    SessionStatusEnum,
    SessionSupervisorsServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';

@Component({
    selector: 'app-supervisors-students',
    templateUrl: './supervisors-students.component.html',
    styleUrls: ['./supervisors-students.component.css'],
})
export class SupervisorsStudentsComponent extends AppComponentBase implements OnInit {
    @ViewChild('attemptsTable', { static: true }) attemptsTable: Table;
    @ViewChild('supervisorsTable', { static: true }) supervisorsTable: Table;
    @ViewChild('paginatorAttempts', { static: true }) paginatorAttempts: Paginator;
    @ViewChild('paginatorSupervisors', { static: true }) paginatorSupervisors: Paginator;
    activeIndex: number = 0; // Initially select Tab 1
    isActiveAttemptsFilter: boolean;
    sessionStatus: any[] = [];
    isStatusFilter: any;

    primengTableHelperForAttempts = new PrimengTableHelper();
    primengTableHelperForSupervisors = new PrimengTableHelper();

    filterAttempts: string;
    filterSupervis: string;
    SessionId: any;
    classId: any;
    sessionName: any;
    schoolName: any;
    execuldedIdFilter: any;
    constructor(
        private _injector: Injector,
        private _SessionsServiceProxy: SessionsServiceProxy,
        private _SessionSupervisorsServiceProxy: SessionSupervisorsServiceProxy,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
        private _ActivatedRoute: ActivatedRoute,
        private _dialogSharedService: DialogSharedService,
    ) {
        super(_injector);
    }
    schoolId: any;
    ngOnInit() {
        this._ActivatedRoute.paramMap?.subscribe((params) => {
            this.SessionId = Number(params?.get('id')); //.get('product');
            this.classId = Number(params?.get('classId')); //.get('product');
            this.schoolId = Number(params?.get('schoolId')); //.get('product');
            this._SessionsServiceProxy.getSessionForView(this.SessionId).subscribe((value) => {
                this.sessionName = value.session.name;
            });

            /*             this.getListSupervis();
             */
        });
        this.schoolName = this._ActivatedRoute.snapshot.queryParams['school'];

        /* Covert Enum To array */
        this.sessionStatus = Object.keys(SessionStatusEnum)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                name: key,
                id: SessionStatusEnum[key as keyof typeof SessionStatusEnum],
            }));
        this.sessionStatus.unshift({ name: 'All', id: undefined });
    }

    getListAttempts(event?: LazyLoadEvent) {
        if (event) {
            if (this.primengTableHelperForAttempts.shouldResetPaging(event)) {
                this.paginatorAttempts.changePage(0);
                if (
                    this.primengTableHelperForAttempts.records &&
                    this.primengTableHelperForAttempts.records.length > 0
                ) {
                    return;
                }
            }
        }

        this.primengTableHelperForAttempts.showLoadingIndicator();

        this._examAttemptsServiceProxy
            .getAll(
                this.filterAttempts,
                undefined,
                this.SessionId,
                this.classId,
                this.isStatusFilter,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            )
            .subscribe((result) => {
                this.primengTableHelperForAttempts.totalRecordsCount = result.totalCount;
                this.primengTableHelperForAttempts.records = result.items;
                this.primengTableHelperForAttempts.hideLoadingIndicator();
            });
    }

    getListSupervis(event?: LazyLoadEvent) {
        if (event) {
            if (this.primengTableHelperForSupervisors.shouldResetPaging(event)) {
                this.paginatorSupervisors.changePage(0);
                if (
                    this.primengTableHelperForSupervisors.records &&
                    this.primengTableHelperForSupervisors.records.length > 0
                ) {
                    return;
                }
            }
        }

        this.primengTableHelperForSupervisors.showLoadingIndicator();

        this._SessionSupervisorsServiceProxy
            .getAll(this.filterSupervis, this.SessionId, this.classId, undefined, undefined, undefined)
            .subscribe((result) => {
                this.primengTableHelperForSupervisors.totalRecordsCount = result.totalCount;
                this.primengTableHelperForSupervisors.records = result.items;
                this.primengTableHelperForSupervisors.hideLoadingIndicator();
                this.execuldedIdFilter = result.items.map((item) => item.sessionSupervisor.id);
            });
    }

    doActionsForAttempts(label: any, record: any) {
        switch (label) {
            case 'MoveStudent':
                console.log("record.examAttempt.studentId :" , record.examAttempt.studentId)
                this._dialogSharedService.showDialog(UniqueNameComponents.Move_Student_dialog, record.examAttempt.studentId);
                break;
        }
    }
    doActionsForSupervisor(label: any, record: any) {
        switch (label) {
            case 'Delete':
                this._SessionSupervisorsServiceProxy.delete(record.sessionSupervisor.id).subscribe((val) => {
                    this.getListSupervis();
                });
                console.log();
                break;
        }
    }
    addSupervisoir() {
        this._dialogSharedService.showDialog(UniqueNameComponents.Add_Supervisor_dialog, {});
    }
    extendSessionTime() {
        this._dialogSharedService.showDialog(UniqueNameComponents.extendTimeSession_dialog, {});
    }
    addStudent() {
        this._dialogSharedService.showDialog(UniqueNameComponents.Add_Student_dialog, {});
    }
}
