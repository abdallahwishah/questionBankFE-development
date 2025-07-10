import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import {
    CreateOrEditStudentStudySubjectDto,
    StudentsServiceProxy,
    StudentStudySubjectsServiceProxy,
} from './../../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';
import { CommonModule } from '@node_modules/@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';

@Component({
    selector: 'app-view-study-subjects',
    templateUrl: './view-study-subjects.component.html',
    styleUrls: ['./view-study-subjects.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        AdminSharedModule,
        TableModule,
        PaginatorModule,
        ActionButtonComponent,
        AutoCompleteFeildModule,
        CheckboxModule,
        DialogSharedModule,
    ],
})
export class ViewStudySubjectsComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    studentId;
    studySubject;
    body = new CreateOrEditStudentStudySubjectDto();
    isShow: boolean = false;

    constructor(
        injector: Injector,
        private studentStudySubjectService: StudentStudySubjectsServiceProxy,
        private dialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }

    ngOnInit() {}

    show(studentId) {
        this.isShow = false;
        this.studentId = studentId;
        this.body.studentId = studentId;
        this.body.cycleNumber = Number(abp.setting.get('App.StudentManagement.StudentRegistrationCycleNumber'));
        this.getAll();
    }

    getAll(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();
        this.studentStudySubjectService
            .getAll(undefined, undefined, undefined, this.studentId, undefined, undefined, undefined, undefined)
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.hideLoadingIndicator();
            });
        this.dialogSharedService.showDialog('student_details', {});
    }

    action(event: any, record: any) {
        switch (event) {
            case 'NotAttempted':
                let bodyNotAttempted = record.studentStudySubject;
                bodyNotAttempted.hasAttempted = false;
                bodyNotAttempted.studentId = this.studentId;
                this.studentStudySubjectService.createOrEdit(record.studentStudySubject).subscribe(() => {
                    this.notify.success(this.l('SavedSuccessfully'));
                    this.getAll();
                });
                break;
            case 'Attempted':
                let bodyAttempted = record.studentStudySubject;
                bodyAttempted.hasAttempted = true;
                bodyAttempted.studentId = this.studentId;
                this.studentStudySubjectService.createOrEdit(record.studentStudySubject).subscribe(() => {
                    this.notify.success(this.l('SavedSuccessfully'));
                    this.getAll();
                });
                break;
        }
    }

    addStudySubject() {
        this.body.studySubjectId = this.studySubject.studySubject.id;
        if (
            !this.primengTableHelper.records.find((item) => {
                return item.studySubjectName == this.studySubject.studySubject.name;
            })
        ) {
            this.studentStudySubjectService.createOrEdit(this.body).subscribe(() => {
                this.notify.success(this.l('SavedSuccessfully'));
                this.isShow = false;
                this.studySubject = undefined;
                this.getAll();
            });
        } else {
            this.message.error(this.l('ThisStudySubjectAlreadyExist'));
        }
    }

    close() {
        this.studySubject = undefined;
        this.body = new CreateOrEditStudentStudySubjectDto();
        this.dialogSharedService.hideDialog('student_details', {});
    }
}
