import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { SupportGroupItemsServiceProxy, SupportGroupItemDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSupportGroupItemModalComponent } from './create-or-edit-supportGroupItem-modal.component';

import { ViewSupportGroupItemModalComponent } from './view-supportGroupItem-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { filter as _filter } from 'lodash-es';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    templateUrl: './supportGroupItems.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SupportGroupItemsComponent extends AppComponentBase {


    @ViewChild('createOrEditSupportGroupItemModal', { static: true }) createOrEditSupportGroupItemModal: CreateOrEditSupportGroupItemModalComponent;
    @ViewChild('viewSupportGroupItemModal', { static: true }) viewSupportGroupItemModal: ViewSupportGroupItemModalComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    valueFilter = '';
    quoteFilter = '';
    maxOrderNoFilter : number;
		maxOrderNoFilterEmpty : number;
		minOrderNoFilter : number;
		minOrderNoFilterEmpty : number;
    isActiveFilter = -1;
        supportGroupNameLFilter = '';





    constructor(
        injector: Injector,
        private _supportGroupItemsServiceProxy: SupportGroupItemsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    getSupportGroupItems(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._supportGroupItemsServiceProxy.getAll(
            this.filterText,
            this.valueFilter,
            this.quoteFilter,
            this.maxOrderNoFilter == null ? this.maxOrderNoFilterEmpty: this.maxOrderNoFilter,
            this.minOrderNoFilter == null ? this.minOrderNoFilterEmpty: this.minOrderNoFilter,
            this.isActiveFilter,
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

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createSupportGroupItem(): void {
        this.createOrEditSupportGroupItemModal.show();
    }
    action(event: any, record: any) {
        switch (event) {
            case 'View':
                this.viewSupportGroupItemModal.show(record)
                break;
            case 'Edit':
                this.createOrEditSupportGroupItemModal.show(record.supportGroupItem.id)
                break;
            case 'Delete':
                this.deleteSupportGroupItem(record.supportGroupItem)
                break;

        }

    }

    changeStatus($event , record){
      /*   this._supportGroupItemsServiceProxy(record.supportGroupItem.id ,$event.checked ).subscribe(val=>{
           this.getComplexities()
        }) */
   }
    deleteSupportGroupItem(supportGroupItem: SupportGroupItemDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._supportGroupItemsServiceProxy.delete(supportGroupItem.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._supportGroupItemsServiceProxy.getSupportGroupItemsToExcel(
        this.filterText,
            this.valueFilter,
            this.quoteFilter,
            this.maxOrderNoFilter == null ? this.maxOrderNoFilterEmpty: this.maxOrderNoFilter,
            this.minOrderNoFilter == null ? this.minOrderNoFilterEmpty: this.minOrderNoFilter,
            this.isActiveFilter,
            this.supportGroupNameLFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }






    resetFilters(): void {
        this.filterText = '';
            this.valueFilter = '';
    this.quoteFilter = '';
    this.maxOrderNoFilter = this.maxOrderNoFilterEmpty;
		this.minOrderNoFilter = this.maxOrderNoFilterEmpty;
    this.isActiveFilter = -1;
		this.supportGroupNameLFilter = '';

        this.getSupportGroupItems();
    }
}
