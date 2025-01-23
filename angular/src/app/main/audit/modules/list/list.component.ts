import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { LazyLoadEvent } from 'primeng/api';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { SessionsServiceProxy, SessionStatusEnum, StudyLevelsServiceProxy, StudySubjectsServiceProxy } from '@shared/service-proxies/service-proxies';
import { Router } from '@node_modules/@angular/router';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
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

    constructor(
        private _injector: Injector,
        private _router:Router,
        private _DialogSharedService: DialogSharedService,
        private _sessionsServiceProxy: SessionsServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,
        
    ) {
        super(_injector);
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
                this.levelId,
                this.subjectId,
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
                this._router.navigate(['/app/main/audit/answers/', record?.session?.id], {
                    queryParams: {
                        session: record?.session.name,
                    },
                });
                break;
        }
    }

    addTemplate(){
        this._DialogSharedService.showDialog(this.Warning_dialog , {})
    }

    clearFilter() {
         this.subjectId = undefined;
        this.levelId = undefined;
        this.getList(); 
    }
    closeFilters(){
        this.FiltersComponent.isPanelOpen = false
     }
}
