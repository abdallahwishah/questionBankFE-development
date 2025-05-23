﻿import { DialogSharedService } from './../../../components/dialog-shared/dialog-shared.service';
import { AppConsts } from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectUnitsServiceProxy, SubjectUnitDto } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSubjectUnitModalComponent } from './create-or-edit-subjectUnit-modal.component';

import { ViewSubjectUnitModalComponent } from './view-subjectUnit-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { filter as _filter } from 'lodash-es';
import { DateTime } from 'luxon';

import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';

@Component({
    templateUrl: './subjectUnits.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
})
export class SubjectUnitsComponent extends AppComponentBase {
    @ViewChild('viewSubjectUnitModal', { static: true }) viewSubjectUnitModal: ViewSubjectUnitModalComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    studySubject: any;
    advancedFiltersAreShown = false;
    filterText = '';
    codeFilter = '';
    isActiveFilter = -1;
    studyLevelValueFilter = '';
    studySubjectValueFilter = '';
    Add_Unit = UniqueNameComponents.Add_Unit;

    constructor(
        injector: Injector,
        private _subjectUnitsServiceProxy: SubjectUnitsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _dateTimeService: DateTimeService,
        private _dialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }

    getSubjectUnits(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._subjectUnitsServiceProxy
            .getAll(
                this.filterText,
                this.codeFilter,
                this.isActiveFilter,
                this.studySubject?.studySubject?.id,
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

    createSubjectUnit(): void {
        this._dialogSharedService.showDialog(this.Add_Unit, {});
    }

    deleteSubjectUnit(subjectUnit: SubjectUnitDto): void {
        this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
            if (isConfirmed) {
                this._subjectUnitsServiceProxy.delete(subjectUnit.id).subscribe(() => {
                    this.reloadPage();
                    this.notify.success(this.l('SuccessfullyDeleted'));
                });
            }
        });
    }

    exportToExcel(): void {
        this._subjectUnitsServiceProxy
            .getSubjectUnitsToExcel(
                this.filterText,
                this.codeFilter,
                this.isActiveFilter,
                this.studyLevelValueFilter,
                this.studySubjectValueFilter,
            )
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    action(event: any, record: any) {
        switch (event) {
            case 'View':
                this.viewSubjectUnitModal.show(record);
                break;
            case 'Edit':
                this._dialogSharedService.showDialog(this.Add_Unit, { id: record.subjectUnit.id });

                break;
            case 'Delete':
                this.deleteSubjectUnit(record.subjectUnit);
                break;
        }
    }

    resetFilters(): void {
        this.filterText = '';
        this.codeFilter = '';
        this.isActiveFilter = -1;
        this.studyLevelValueFilter = '';
        this.studySubjectValueFilter = '';

        this.getSubjectUnits();
    }
    changeStatus($event, record) {
        this._subjectUnitsServiceProxy
            .updateSubjectUnitStatus(record.subjectUnit.id, $event.checked)
            .subscribe((val) => {});
    }
}
