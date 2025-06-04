import { SupervisorDto, SupervisorsServiceProxy } from './../../../../../shared/service-proxies/service-proxies';
import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditSupervisorModalComponent } from './create-or-edit-supervisor-modal/create-or-edit-supervisor-modal.component';

@Component({
    selector: 'app-supervisors',
    templateUrl: './supervisors.component.html',
    styleUrls: ['./supervisors.component.css'],
})
export class SupervisorsComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('createOrEditSupervisor', { static: true })
    createOrEditSupervisor: CreateOrEditSupervisorModalComponent;
    filterText: string;

    constructor(
        injector: Injector,
        private supervisorsService: SupervisorsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {}

    getSupervisors(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();
        this.supervisorsService
            .getAll(
                this.filterText,
                undefined,
                undefined,
                undefined,
                undefined,
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

    deleteSupervisor(student: SupervisorDto): void {
        this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
            if (isConfirmed) {
                this.supervisorsService.delete(student.id).subscribe(() => {
                    this.reloadPage();
                    this.notify.success(this.l('SuccessfullyDeleted'));
                });
            }
        });
    }

    action(event: any, record: any) {
        switch (event) {
            case 'View':
                break;
            case 'Edit':
                this.createOrEditSupervisor.show(record.supervisor.id);
                break;
            case 'Delete':
                this.deleteSupervisor(record.supervisor);
                break;
        }
    }

    exportToExcel() {}
}
