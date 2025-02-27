import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { ReportItemsServiceProxy, ReportItemDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditReportItemModalComponent } from './create-or-edit-reportItem-modal.component';

import { ViewReportItemModalComponent } from './view-reportItem-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { filter as _filter } from 'lodash-es';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { ViewDetailsComponent } from '@app/shared/components/view-details/view-details.component';

@Component({
    templateUrl: './reportItems.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ReportItemsComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditReportItemModal', { static: true }) createOrEditReportItemModal: CreateOrEditReportItemModalComponent;
    @ViewChild('viewReportItemModal', { static: true }) viewReportItemModal: ViewReportItemModalComponent;
    @ViewChild('ViewDetailsComponent', { static: true }) viewShared: ViewDetailsComponent ;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    displayNameFilter = '';
    nameFilter = '';
    isPublishFilter = -1;
    documentLibraryId:any;
    constructor(
        injector: Injector,
        private _reportItemsServiceProxy: ReportItemsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
             private _dateTimeService: DateTimeService,
             private _router:Router,

    ) {
        super(injector);
    }
    ngOnInit(): void {
        this._activatedRoute.paramMap.subscribe((param: any) => {
            if (param.get('id')) {
                this.documentLibraryId = param.get('id');
            }
        });
    }

    getReportItems(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._reportItemsServiceProxy.getAll(
            this.filterText,
            this.displayNameFilter,
            this.nameFilter,
            this.isPublishFilter,
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

    createReportItem(): void {
        this.createOrEditReportItemModal.show();
    }


    deleteReportItem(reportItem: ReportItemDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._reportItemsServiceProxy.delete(reportItem.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._reportItemsServiceProxy.getReportItemsToExcel(
        this.filterText,
            this.displayNameFilter,
            this.nameFilter,
            this.isPublishFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }






    resetFilters(): void {
        this.filterText = '';
            this.displayNameFilter = '';
    this.nameFilter = '';
    this.isPublishFilter = -1;

        this.getReportItems();
    }

    doActions(label: any,record:any) {
        switch (label) {
            case 'View':
                this.viewReportItemModal.show(record)
                break;
            case 'Edit':
                this.createOrEditReportItemModal.show(record.reportItem.id)
                break;
            case 'Delete':
                this.deleteReportItem(record.reportItem)
                break;
            case 'Design':
                 this._router.navigate(['/app/main/report/reportItems/desgin/' +record.reportItem.name])
                break;
            case 'Viewer':
                 this._router.navigate(['/app/main/report/reportItems/viewer/'+record.reportItem.name])
                 break;
        }
    }
}

