import { AppConsts } from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    StudySubjectsServiceProxy,
    StudySubjectDto,
    QuestionLanguageEnum,
} from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditStudySubjectModalComponent } from './create-or-edit-studySubject-modal.component';

import { ViewStudySubjectModalComponent } from './view-studySubject-modal.component';
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
    templateUrl: './studySubjects.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
})
export class StudySubjectsComponent extends AppComponentBase {
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('createOrEditStudySubjectModal', { static: true })
    createOrEditStudySubjectModal: CreateOrEditStudySubjectModalComponent;
    @ViewChild('viewStudySubjectModal', { static: true }) viewStudySubjectModal: ViewStudySubjectModalComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    languageFilter = -1;
    isActiveFilter = -1;

    questionLanguageEnum = QuestionLanguageEnum;

    _entityTypeFullName = 'MIS.Lookups.StudySubject';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _studySubjectsServiceProxy: StudySubjectsServiceProxy,
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

    getStudySubjects(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._studySubjectsServiceProxy
            .getAll(
                this.filterText,
                undefined,

                this.languageFilter,
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

    createStudySubject(): void {
        this.createOrEditStudySubjectModal.show();
    }

    showHistory(studySubject: StudySubjectDto): void {
        this.entityTypeHistoryModal.show({
            entityId: studySubject.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: '',
        });
    }

    deleteStudySubject(studySubject: StudySubjectDto): void {
        this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
            if (isConfirmed) {
                this._studySubjectsServiceProxy.delete(studySubject.id).subscribe(() => {
                    this.reloadPage();
                    this.notify.success(this.l('SuccessfullyDeleted'));
                });
            }
        });
    }

    exportToExcel(): void {
        this._studySubjectsServiceProxy
            .getStudySubjectsToExcel(this.filterText, this.languageFilter, this.isActiveFilter)
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    action(event: any, record: any) {
        switch (event) {
            case 'View':
                this.viewStudySubjectModal.show(record);
                break;
            case 'Edit':
                this.createOrEditStudySubjectModal.show(record.studySubject.id);
                break;
            case 'Delete':
                this.deleteStudySubject(record.studySubject);
                break;
            case 'History':
                this.showHistory(record.studySubject);
                break;
        }
    }

    changeStatus($event, record) {
        this._studySubjectsServiceProxy
            .updateStudyLevelStatus(record.studySubject.id, $event.checked)
            .subscribe((val) => {
                this.getStudySubjects();
            });
    }

    resetFilters(): void {
        this.filterText = '';
        this.languageFilter = -1;
        this.isActiveFilter = -1;

        this.getStudySubjects();
    }
}
