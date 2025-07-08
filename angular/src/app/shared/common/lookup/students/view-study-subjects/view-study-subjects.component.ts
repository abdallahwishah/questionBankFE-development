import { StudentStudySubjectsServiceProxy } from './../../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from '@node_modules/ngx-bootstrap/modal';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-view-study-subjects',
    templateUrl: './view-study-subjects.component.html',
    styleUrls: ['./view-study-subjects.component.css'],
    standalone: false,
})
export class ViewStudySubjectsComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('viewDetails', { static: true }) modal: ModalDirective;
    studentId;

    constructor(
        injector: Injector,
        private studentStudySubjectService: StudentStudySubjectsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {}

    show(studentId) {
        this.studentId = studentId;
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
        this.modal.show();
    }

    close() {
        this.modal.hide();
    }
}
