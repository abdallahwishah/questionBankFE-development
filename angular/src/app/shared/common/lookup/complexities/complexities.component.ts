import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { ComplexitiesServiceProxy, ComplexityDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditComplexityModalComponent } from './create-or-edit-complexity-modal.component';

import { ViewComplexityModalComponent } from './view-complexity-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { filter as _filter } from 'lodash-es';
import { DateTime } from 'luxon';

             import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    templateUrl: './complexities.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ComplexitiesComponent extends AppComponentBase {


    @ViewChild('createOrEditComplexityModal', { static: true }) createOrEditComplexityModal: CreateOrEditComplexityModalComponent;
    @ViewChild('viewComplexityModal', { static: true }) viewComplexityModal: ViewComplexityModalComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    isActiveFilter = -1;






    constructor(
        injector: Injector,
        private _complexitiesServiceProxy: ComplexitiesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
             private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    getComplexities(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._complexitiesServiceProxy.getAll(
            this.filterText,
            this.isActiveFilter,
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

    createComplexity(): void {
        this.createOrEditComplexityModal.show();
    }


    deleteComplexity(complexity: ComplexityDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._complexitiesServiceProxy.delete(complexity.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._complexitiesServiceProxy.getComplexitiesToExcel(
        this.filterText,
            this.isActiveFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }



    action(event: any, record: any) {
        switch (event) {
            case 'View':
                this.viewComplexityModal.show(record)
                break;
            case 'Edit':
                this.createOrEditComplexityModal.show(record.complexity.id)
                break;
            case 'Delete':
                this.deleteComplexity(record.complexity)
                break;
        }

    }





    resetFilters(): void {
        this.filterText = '';
            this.isActiveFilter = -1;

        this.getComplexities();
    }
}
