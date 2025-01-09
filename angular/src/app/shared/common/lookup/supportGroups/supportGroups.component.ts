import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { SupportGroupsServiceProxy, SupportGroupDto , SupportGroupTypeEnum } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSupportGroupModalComponent } from './create-or-edit-supportGroup-modal.component';

import { ViewSupportGroupModalComponent } from './view-supportGroup-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import { filter as _filter } from 'lodash-es';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    templateUrl: './supportGroups.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SupportGroupsComponent extends AppComponentBase {
    
    
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('createOrEditSupportGroupModal', { static: true }) createOrEditSupportGroupModal: CreateOrEditSupportGroupModalComponent;
    @ViewChild('viewSupportGroupModal', { static: true }) viewSupportGroupModal: ViewSupportGroupModalComponent;   
    
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    isActiveFilter = -1;
    nameLFilter = '';
    nameFFilter = '';
    groupTypeFilter = -1;

    supportGroupTypeEnum = SupportGroupTypeEnum;

    _entityTypeFullName = 'MIS.Lookups.SupportGroup';
    entityHistoryEnabled = false;
    checkedActive:boolean = true;



    constructor(
        injector: Injector,
        private _supportGroupsServiceProxy: SupportGroupsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return this.isGrantedAny('Pages.Administration.AuditLogs') && customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getSupportGroups(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._supportGroupsServiceProxy.getAll(
            this.filterText,
            this.isActiveFilter,
            this.nameLFilter,
            this.nameFFilter,
            this.groupTypeFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createSupportGroup(): void {
        this.createOrEditSupportGroupModal.show();        
    }
    action(event: any, record: any) {
        switch (event) {
            case 'View':
                this.viewSupportGroupModal.show(record)
                break;
            case 'Edit':
                this.createOrEditSupportGroupModal.show(record.supportGroup.id)
                break;
            case 'Delete':
                this.deleteSupportGroup(record.supportGroup)
                break;
            case 'History':
                this.showHistory(record.supportGroup)
                break;

        }

    }
    getCheckedActive($event){
        if(!$event.checked){
            this.checkedActive = false
        }else{
            this.checkedActive = true
        }
    }


    showHistory(supportGroup: SupportGroupDto): void {
        this.entityTypeHistoryModal.show({
            entityId: supportGroup.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSupportGroup(supportGroup: SupportGroupDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._supportGroupsServiceProxy.delete(supportGroup.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._supportGroupsServiceProxy.getSupportGroupsToExcel(
        this.filterText,
            this.isActiveFilter,
            this.nameLFilter,
            this.nameFFilter,
            this.groupTypeFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
    
    
    
    
    

    resetFilters(): void {
        this.filterText = '';
            this.isActiveFilter = -1;
    this.nameLFilter = '';
    this.nameFFilter = '';
    this.groupTypeFilter = -1;

        this.getSupportGroups();
    }
}
