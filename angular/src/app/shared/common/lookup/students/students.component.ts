import { StudentDto, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditStudentModalComponent } from './create-or-edit-student-modal/create-or-edit-student-modal.component';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AppConsts } from '@shared/AppConsts';
import { FileUpload } from 'primeng/fileupload';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { ViewStudySubjectsComponent } from './view-study-subjects/view-study-subjects.component';

@Component({
    selector: 'app-students',
    templateUrl: './students.component.html',
    styleUrls: ['./students.component.css'],
})
export class StudentsComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('createOrEditStudent', { static: true })
    createOrEditStudent: CreateOrEditStudentModalComponent;
    @ViewChild(FiltersComponent) FiltersComponent: FiltersComponent;
    @ViewChild('viewStudySubjectsComponent') viewStudySubjectsComponent: ViewStudySubjectsComponent;
    @ViewChild('ExcelFileUpload', { static: false }) excelFileUpload: FileUpload;
    filterText: string;
    uploadUrl = AppConsts.remoteServiceBaseUrl + '/Students/ImportFromExcel';
    studySubject = [];
    governorate;
    registerCompletedFilter: boolean;
    registerCompletedList = [
        { id: true, displayName: this.l('Yes') },
        { id: false, displayName: this.l('No') },
    ];

    constructor(
        injector: Injector,
        private studentsServiceProxy: StudentsServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _httpClient: HttpClient,
    ) {
        super(injector);
    }

    ngOnInit() {}

    getStudents(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();
        let studySubjectIdList = [];
        if (this.studySubject.length) {
            this.studySubject.map((result) => {
                if (!studySubjectIdList.find((item) => item == result.studySubject.id)) {
                    studySubjectIdList.push(result.studySubject.id);
                }
            });
        }

        this.studentsServiceProxy
            .getAll(
                this.filterText,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.governorate?.governorate?.id,
                studySubjectIdList,
                this.registerCompletedFilter,
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

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    deleteStudent(student: StudentDto): void {
        this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
            if (isConfirmed) {
                this.studentsServiceProxy.delete(student.id).subscribe(() => {
                    this.reloadPage();
                    this.notify.success(this.l('SuccessfullyDeleted'));
                });
            }
        });
    }

    action(event: any, record: any) {
        switch (event) {
            case 'Edit':
                this.createOrEditStudent.show(record.student.id);
                break;
            case 'Delete':
                this.deleteStudent(record.student);
                break;
            case 'ViewStudySubjects':
                this.viewStudySubjectsComponent.show(record.student.id);
                break;
        }
    }

    exportToExcel() {
        this.studentsServiceProxy
            .getStudentsToExcel(this.filterText, undefined, undefined, undefined, undefined)
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    uploadExcel(data: { files: File }): void {
        const formData: FormData = new FormData();
        const file = data.files[0];
        formData.append('file', file, file.name);

        this._httpClient
            .post<any>(this.uploadUrl, formData)
            .pipe(finalize(() => this.excelFileUpload.clear()))
            .subscribe((response) => {
                if (response.success) {
                    this.notify.success(this.l('ImportStudentsProcessStart'));
                } else if (response.error != null) {
                    this.notify.error(this.l('ImportStudentsUploadFailed'));
                }
            });
    }

    onUploadExcelError(): void {
        this.notify.error(this.l('ImportStudentsUploadFailed'));
    }

    closeFilters() {
        this.FiltersComponent.isPanelOpen = false;
    }
    clearFilter() {
        this.studySubject = [];
        this.governorate = undefined;
        this.registerCompletedFilter = undefined;
        this.getStudents();
        this.closeFilters();
    }
}
