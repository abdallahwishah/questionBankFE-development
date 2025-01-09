import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { SubjectGroupsServiceProxy, SubjectGroupDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSubjectGroupModalComponent } from './create-or-edit-subjectGroup-modal.component';

import { ViewSubjectGroupModalComponent } from './view-subjectGroup-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { filter as _filter } from 'lodash-es';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    templateUrl: './subjectGroups.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SubjectGroupsComponent extends AppComponentBase {
    
    
    @ViewChild('createOrEditSubjectGroupModal', { static: true }) createOrEditSubjectGroupModal: CreateOrEditSubjectGroupModalComponent;
    @ViewChild('viewSubjectGroupModal', { static: true }) viewSubjectGroupModal: ViewSubjectGroupModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    noteFilter = '';
        studySubjectValueFilter = '';
        supportGroupNameLFilter = '';






    constructor(
        injector: Injector,
        private _subjectGroupsServiceProxy: SubjectGroupsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    getSubjectGroups(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._subjectGroupsServiceProxy.getAll(
            this.filterText,
            this.noteFilter,
            this.studySubjectValueFilter,
            this.supportGroupNameLFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    action(event: any, record: any) {
        switch (event) {
            case 'View':
                this.viewSubjectGroupModal.show(record)
                break;
            case 'Edit':
                this.createOrEditSubjectGroupModal.show(record.subjectGroup.id)
                break;
            case 'Delete':
                this.deleteSubjectGroup(record.subjectGroup)
                break;

        }

    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createSubjectGroup(): void {
        this.createOrEditSubjectGroupModal.show();        
    }


    deleteSubjectGroup(subjectGroup: SubjectGroupDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._subjectGroupsServiceProxy.delete(subjectGroup.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._subjectGroupsServiceProxy.getSubjectGroupsToExcel(
        this.filterText,
            this.noteFilter,
            this.studySubjectValueFilter,
            this.supportGroupNameLFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    

    resetFilters(): void {
        this.filterText = '';
            this.noteFilter = '';
		this.studySubjectValueFilter = '';
							this.supportGroupNameLFilter = '';
					
        this.getSubjectGroups();
    }
}
