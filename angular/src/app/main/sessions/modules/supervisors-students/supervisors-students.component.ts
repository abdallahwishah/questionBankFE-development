import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { ActivatedRoute } from '@angular/router';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ExamAttemptsServiceProxy,
    SessionsServiceProxy,
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
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    primengTableHelperForAttempts = new PrimengTableHelper();
    primengTableHelperForSupervisors = new PrimengTableHelper();

    filter: string;
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
    }

    getListAttempts(event?: LazyLoadEvent) {
        if (event) {
            if (this.primengTableHelperForAttempts.shouldResetPaging(event)) {
                this.paginator.changePage(0);
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
                this.filter,
                undefined,
                this.SessionId,
                this.classId,
                undefined,
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
                this.paginator.changePage(0);
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
            .getAll(this.filter, this.SessionId, this.classId, undefined, undefined, undefined)
            .subscribe((result) => {
                this.primengTableHelperForSupervisors.totalRecordsCount = result.totalCount;
                this.primengTableHelperForSupervisors.records = result.items;
                this.primengTableHelperForSupervisors.hideLoadingIndicator();
                this.execuldedIdFilter = result.items.map((item) => item.sessionSupervisor.id);
            });
    }

    doActions(label: any, record: any) {
        switch (label) {
            case 'View':
                console.log();
                break;
        }
    }
    addSupervisoir() {
        this._dialogSharedService.showDialog(UniqueNameComponents.Add_Supervisor_dialog, {});
    }
}
