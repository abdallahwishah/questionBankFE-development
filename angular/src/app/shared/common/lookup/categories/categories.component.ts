import {AppConsts} from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { CategoriesServiceProxy, CategoryDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditCategoryModalComponent } from './create-or-edit-category-modal.component';

import { ViewCategoryModalComponent } from './view-category-modal.component';
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
    templateUrl: './categories.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class CategoriesComponent extends AppComponentBase {


    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('createOrEditCategoryModal', { static: true }) createOrEditCategoryModal: CreateOrEditCategoryModalComponent;
    @ViewChild('viewCategoryModal', { static: true }) viewCategoryModal: ViewCategoryModalComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    isActiveFilter = -1;
    checkedActive:boolean = true;

    _entityTypeFullName = 'MIS.Lookups.Category';
    entityHistoryEnabled = false;



    constructor(
        injector: Injector,
        private _categoriesServiceProxy: CategoriesServiceProxy,
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

    getCategories(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._categoriesServiceProxy.getAll(
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

    createCategory(): void {
        this.createOrEditCategoryModal.show();
    }


    showHistory(category: CategoryDto): void {
        this.entityTypeHistoryModal.show({
            entityId: category.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteCategory(category: CategoryDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._categoriesServiceProxy.delete(category.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._categoriesServiceProxy.getCategoriesToExcel(
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
                this.viewCategoryModal.show(record)
                break;
            case 'Edit':
                this.createOrEditCategoryModal.show(record.complexity.id)
                break;
            case 'Delete':
                this.deleteCategory(record.complexity)
                break;
            case 'History':
                this.showHistory(record.category)
                break;
        }

    }




    resetFilters(): void {
        this.filterText = '';
            this.isActiveFilter = -1;

        this.getCategories();
    }
        getCheckedActive($event){
            if(!$event.checked){
                this.checkedActive = false
            }else{
                this.checkedActive = true
            }
        }
}
