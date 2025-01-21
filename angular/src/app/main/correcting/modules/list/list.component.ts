import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { Router } from '@node_modules/@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionsServiceProxy, SessionStatusEnum, StudyLevelsServiceProxy, StudySubjectsServiceProxy } from '@shared/service-proxies/service-proxies';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class ListComponent extends AppComponentBase implements OnInit {
    Warning_dialog = UniqueNameComponents.Warning_dialog;
    @ViewChild(FiltersComponent) FiltersComponent: FiltersComponent;
    
    studyLevels: any[] = [];
    studySubjects: any[] = [];
    subjectId: number;
    levelId: number;
    loadingFilter: boolean = false;

    filter: string;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    sessionStatusEnum = SessionStatusEnum;
    isAudit: any;
    constructor(
        private _injector: Injector,
        private _router: Router,
        private _DialogSharedService: DialogSharedService,
        private _sessionsServiceProxy: SessionsServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,
    ) {
        super(_injector);
        this.isAudit = window?.location.href.includes('audit');
    }

    ngOnInit() {
            // Use forkJoin to get all references in parallel
            forkJoin([
                this._studyLevelsServiceProxy.getAll(
                    undefined, // filter
                    undefined, // sorting
                    undefined, // skipCount
                    undefined, // maxResultCount
                    undefined, // extra param
                ),
                this._studySubjectsProxy.getAll(undefined, undefined, undefined, undefined, undefined, undefined),
            ]).subscribe({
                next: ([studyLevelsRes, studySubjectsRes]) => {
                    // Map each response to your arrays
                    this.studyLevels = studyLevelsRes.items.map((item) => ({
                        id: item.studyLevel.id,
                        name: item.studyLevel.name,
                    }));
    
                    this.studySubjects = studySubjectsRes.items.map((item) => ({
                        id: item.studySubject.id,
                        name: item.studySubject.name,
                    }));
                },
                error: (err) => {
                    // Handle error if needed
                    this.loadingFilter = false;
                },
            });
    }
    getList(event?: LazyLoadEvent) {
        if (event) {
            if (this.primengTableHelper.shouldResetPaging(event)) {
                this.paginator.changePage(0);
                if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                    return;
                }
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._sessionsServiceProxy
            .getAllForCorrectionOrAudited(
                this.filter,
                undefined,
                undefined,
                undefined,
                this.levelId || undefined,
                this.subjectId ||undefined,
                undefined,
                undefined,
                undefined,
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

    doActions(label: any, record: any) {
        switch (label) {
            case 'ViewAnswersStudent':
                this._router.navigate(['/app/main/correcting/answers/', record?.session?.id]);
                console.log();
                break;
        }
    }
    clearFilter() {
        this.subjectId = undefined;
        this.levelId = undefined;
        this.getList();
    }

    addTemplate() {
        this._DialogSharedService.showDialog(this.Warning_dialog, {});
    }

    closeFilters(){
        this.FiltersComponent.isPanelOpen = false
     }
}
