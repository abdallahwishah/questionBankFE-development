﻿import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { DataConnectionsServiceProxy, DataConnectionDto , DataConnectionTypeEnum } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditDataConnectionModalComponent } from './create-or-edit-dataConnection-modal.component';

import { ViewDataConnectionModalComponent } from './view-dataConnection-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { filter as _filter } from 'lodash-es';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    templateUrl: './dataConnections.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class DataConnectionsComponent extends AppComponentBase {


    @ViewChild('createOrEditDataConnectionModal', { static: true }) createOrEditDataConnectionModal: CreateOrEditDataConnectionModalComponent;
    @ViewChild('viewDataConnectionModal', { static: true }) viewDataConnectionModal: ViewDataConnectionModalComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    dataConnectionTypeFilter = -1;
    connectionStringFilter = '';

    dataConnectionTypeEnum = DataConnectionTypeEnum;





    constructor(
        injector: Injector,
        private _dataConnectionsServiceProxy: DataConnectionsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    getDataConnections(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._dataConnectionsServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.dataConnectionTypeFilter,
            this.connectionStringFilter,
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

    createDataConnection(): void {
        this.createOrEditDataConnectionModal.show();
    }


    deleteDataConnection(dataConnection: DataConnectionDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._dataConnectionsServiceProxy.delete(dataConnection.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._dataConnectionsServiceProxy.getDataConnectionsToExcel(
        this.filterText,
            this.nameFilter,
            this.dataConnectionTypeFilter,
            this.connectionStringFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }






    resetFilters(): void {
        this.filterText = '';
            this.nameFilter = '';
    this.dataConnectionTypeFilter = -1;
    this.connectionStringFilter = '';

        this.getDataConnections();
    }

    doActions(label: any,record:any) {
        switch (label) {
            case 'View':
                this.viewDataConnectionModal.show(record)
                break;
            case 'Edit':
                this.createOrEditDataConnectionModal.show(record.dataConnection.id)
                break;
            case 'Delete':
                this.deleteDataConnection(record.dataConnection)
                break;

        }
    }


}
