import { SessionStatusEnum } from './../../../../../shared/service-proxies/service-proxies';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ExamAttemptsServiceProxy,
    SessionsServiceProxy,
    SessionSupervisorRoleEnum,
    SessionSupervisorsServiceProxy,
    StopSessionDto,
} from '@shared/service-proxies/service-proxies';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';

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
    studyLevel;
    primengTableHelperForAttempts = new PrimengTableHelper();
    primengTableHelperForSupervisors = new PrimengTableHelper();
    dir = document.documentElement.getAttribute('dir');

    filterAttempts: string;
    filterSupervis: string;
    SessionId: any;
    classId: any;
    sessionName: any;
    schoolName: any;
    execuldedIdFilter: any;
    SessionSupervisorRoleEnum = SessionSupervisorRoleEnum;
    selectedProducts: any[] = [];
    governorates: any[] = [];
    sessionStatusEnum = SessionStatusEnum;
    session: any;
    FormNumberListArray: any[] = [];
    public roleArabicMap = {
        HallChief: 'رئيس القاعة',
        AssistantHallChief: 'مساعد رئيس القاعة',
        Supervisor: 'مشرف',
        EducationalGuide: 'مرشد تعليمي',
        Janitor: 'عامل نظافة',
    };

    SchoolIdFilter: any;
    StudentClassIdFilter: any;
    StudyLevelIdFilter: any;
    FormNumberListFilter: any;
    StudentAddressFilter: any;
    constructor(
        private _injector: Injector,
        private _SessionsServiceProxy: SessionsServiceProxy,
        private _SessionSupervisorsServiceProxy: SessionSupervisorsServiceProxy,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
        private _ActivatedRoute: ActivatedRoute,
        private _dialogSharedService: DialogSharedService,
        private _router: Router,
    ) {
        super(_injector);
    }
    schoolId: any;
    ngOnInit() {
        this._ActivatedRoute.paramMap?.subscribe((params) => {
            this.SessionId = Number(params?.get('id')); //.get('product');
            this.classId = Number(params?.get('classId')); //.get('product');
            this._SessionsServiceProxy.getSessionForView(this.SessionId).subscribe((value) => {
                this.sessionName = value.session.name;
                this.session = value;
                this.FormNumberListArray = Array.from({ length: value?.versionCount }, (_, i) => ({
                    id: i + 1,
                    name: i + 1,
                }));
            });
        });
        this.schoolName = this._ActivatedRoute.snapshot.queryParams['school'];
        this.schoolId = this._ActivatedRoute.snapshot.queryParams['schoolId'];

        /* Covert Enum To array */
        this.sessionStatus = Object.keys(SessionStatusEnum)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                name: key,
                id: SessionStatusEnum[key as keyof typeof SessionStatusEnum],
            }));
        this.sessionStatus.unshift({ name: 'All', id: undefined });
    }
    governorateIdFilter: any;
    YearFilter: any;
    cycleFilter: any;
    hasFinishedFilter;
    doesNotAnswerFilter;
    hasAttemptedFilter;

    // Add this in your component class
    selectedEmployeeId: string | null = null;
    showVideoCall: boolean = false;
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
                this.governorateIdFilter?.governorate?.id,
                undefined,
                this.FormNumberListFilter ? [this.FormNumberListFilter] : undefined,
                this.StudyLevelIdFilter?.studyLevel?.id,
                undefined,

                this.StudentAddressFilter,
                this.YearFilter,
                this.cycleFilter,
                this.hasFinishedFilter || this.hasFinishedFilter == false ? this.hasFinishedFilter : undefined,
                this.doesNotAnswerFilter || undefined,
                this.hasAttemptedFilter || this.hasAttemptedFilter == false ? this.hasAttemptedFilter : undefined,

                this.primengTableHelper.getSorting(this.attemptsTable),
                this.primengTableHelper.getSkipCount(this.paginatorAttempts, event),
                this.primengTableHelper.getMaxResultCount(this.paginatorAttempts, event),
            )
            .subscribe((result) => {
                this.primengTableHelperForAttempts.totalRecordsCount = result.totalCount;
                this.primengTableHelperForAttempts.records = result.items;
                this.primengTableHelperForAttempts.hideLoadingIndicator();
            });
    }
    supervisour: any;
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
            .getAll(
                this.filterSupervis,
                this.SessionId,
                this.classId,
                undefined,
                this.primengTableHelper.getSorting(this.supervisorsTable),
                this.primengTableHelper.getSkipCount(this.paginatorSupervisors, event),
                this.primengTableHelper.getMaxResultCount(this.paginatorSupervisors, event),
            )
            .subscribe((result) => {
                this.primengTableHelperForSupervisors.totalRecordsCount = result.totalCount;
                this.primengTableHelperForSupervisors.records = result.items;
                this.primengTableHelperForSupervisors.hideLoadingIndicator();
                this.execuldedIdFilter = result.items.map((item) => item.sessionSupervisor.id);
            });
    }
    studentId: any;
    doActionsForAttempts(label: any, record: any) {
        switch (label) {
            case 'MoveStudent':
                console.log('record.examAttempt.studentId :', record.examAttempt.studentId);
                this._dialogSharedService.showDialog(
                    UniqueNameComponents.Move_Student_dialog,
                    record.examAttempt.studentId,
                );
                break;
            case 'Extend':
                this.studentId = record.examAttempt.studentId;
                this._dialogSharedService.showDialog(
                    UniqueNameComponents.extendTimeSession_dialog,
                    record.examAttempt.studentId,
                );
                break;
            case 'Stop':
                this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
                    if (isConfirmed) {
                        this._SessionsServiceProxy
                            .stopSession(
                                new StopSessionDto({
                                    schoolClassId: this.classId,
                                    schoolId: this.schoolId,
                                    sessionId: this.SessionId,
                                    studentId: record.examAttempt.studentId,
                                }),
                            )
                            .subscribe((res) => {
                                this.getListAttempts();
                            });
                    }
                });
                break;
            case 'RequestCamera':
                this.selectedEmployeeId = record.userId;
                this.showVideoCall = true;
                // scroll to top window
                window.scrollTo(0, 0);
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
            case 'MoveSupervisor':
                this._dialogSharedService.showDialog(UniqueNameComponents.Move_Student_dialog, {
                    sessionSupervisor: record.sessionSupervisor.supervisorId,
                });
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
    MoveStudent() {
        this._dialogSharedService.showDialog(
            UniqueNameComponents.Move_Student_dialog,
            this.selectedProducts?.map((value) => value?.examAttempt?.studentId),
        );
    }
    @ViewChild(FiltersComponent) FiltersComponent: FiltersComponent;

    closeFilters() {
        this.FiltersComponent.isPanelOpen = false;
    }
    clearFilter() {
        this.FiltersComponent.isPanelOpen = false;
        this.governorateIdFilter = undefined;
        this.isStatusFilter = undefined;
        this.FormNumberListFilter = undefined;
        this.StudyLevelIdFilter = undefined;
        this.StudentAddressFilter = undefined;
        this.YearFilter = undefined;
        this.cycleFilter = undefined;
        this.getListAttempts();
    }
    goToClasses() {
        this._router.navigate(['../../../schools', this.SessionId], {
            queryParamsHandling: 'merge',
            relativeTo: this._ActivatedRoute,
        });
    }
    getSchoolClassForViewDtos: any;
    get() {
        this.getSchoolClassForViewDtos = this.schoolId?.getSchoolClassForViewDtos?.map((value) => {
            return {
                id: value?.schoolClass?.id,
                name: value?.schoolClass?.name,
            };
        });
    }
    // Handle call events if needed
    handleCallEnded(reason: string): void {
        console.log('Call ended:', reason);
        this.showVideoCall = false;
        // Optional: Add any cleanup or notification logic here
    }
}
