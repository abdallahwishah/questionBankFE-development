import { AppConsts } from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GovernoratesServiceProxy, GovernorateDto } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditGovernorateModalComponent } from './create-or-edit-governorate-modal.component';

import { ViewGovernorateModalComponent } from './view-governorate-modal.component';
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
    templateUrl: './governorates.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
})
export class GovernoratesComponent extends AppComponentBase {
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('createOrEditGovernorateModal', { static: true })
    createOrEditGovernorateModal: CreateOrEditGovernorateModalComponent;
    @ViewChild('viewGovernorateModal', { static: true }) viewGovernorateModal: ViewGovernorateModalComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    isActiveFilter = -1;

    _entityTypeFullName = 'MIS.Lookups.Governorate';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _governoratesServiceProxy: GovernoratesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _dateTimeService: DateTimeService,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return (
            this.isGrantedAny('Pages.Administration.AuditLogs') &&
            customSettings.EntityHistory &&
            customSettings.EntityHistory.isEnabled &&
            _filter(
                customSettings.EntityHistory.enabledEntities,
                (entityType) => entityType === this._entityTypeFullName,
            ).length === 1
        );
    }

    getGovernorates(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._governoratesServiceProxy
            .getAll(
                this.filterText,
                this.isActiveFilter,
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

    createGovernorate(): void {
        this.createOrEditGovernorateModal.show();
    }

    showHistory(governorate: GovernorateDto): void {
        this.entityTypeHistoryModal.show({
            entityId: governorate.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: '',
        });
    }

    deleteGovernorate(governorate: GovernorateDto): void {
        this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
            if (isConfirmed) {
                this._governoratesServiceProxy.delete(governorate.id).subscribe(() => {
                    this.reloadPage();
                    this.notify.success(this.l('SuccessfullyDeleted'));
                });
            }
        });
    }

    exportToExcel(): void {
        this._governoratesServiceProxy
            .getGovernoratesToExcel(this.filterText, this.isActiveFilter)
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    action(event: any, record: any) {
        switch (event) {
            case 'View':
                this.viewGovernorateModal.show(record);
                break;
            case 'Edit':
                this.createOrEditGovernorateModal.show(record.governorate.id);
                break;
            case 'Delete':
                this.deleteGovernorate(record.governorate);
                break;
        }
    }

    changeStatus($event, record) {
        this._governoratesServiceProxy
            .updateGovernorateActiveStatus(record.governorate.id, $event.checked)
            .subscribe((val) => {});
    }

    resetFilters(): void {
        this.filterText = '';
        this.isActiveFilter = -1;

        this.getGovernorates();
    }
}
