import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { Router } from '@node_modules/@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { forkJoin } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ExamTemplatesServiceProxy,
    StudyLevelsServiceProxy,
    StudySubjectsServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class ListComponent extends AppComponentBase implements OnInit {
    @ViewChild(FiltersComponent) FiltersComponent: FiltersComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    studyLevels: any[] = [];
    studySubjects: any[] = [];

    Warning_dialog = UniqueNameComponents.Warning_dialog;
    Copy_Template_dialog = UniqueNameComponents.Copy_Template_dialog;

    filter: string;
    subjectId: number;
    levelId: number;
    loadingFilter = false;

    constructor(
        private _injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _examTemplatesServiceProxy: ExamTemplatesServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,
        private _router: Router,
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
            this._studySubjectsProxy.getAll(
                undefined,
                undefined,
                undefined,

                undefined,
                undefined,
                undefined,
                undefined,
            ),
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

        this._examTemplatesServiceProxy
            .getAll(
                this.filter,
                undefined,
                undefined,
                this.levelId || undefined,
                this.subjectId || undefined,
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

    clearFilter() {
        this.subjectId = undefined;
        this.levelId = undefined;
        this.getList();
    }
    doActions(label: any, record: any) {
        switch (label) {
            case 'Edit':
                this._router.navigate(['app/main/templates/add-template/' + record.examTemplate.id]);
                break;
            case 'CreateTest':
                this._DialogSharedService.showDialog(this.Warning_dialog, {
                    confirm: () => {
                        this._examTemplatesServiceProxy
                            .generateExamByTemplate(record.examTemplate.id)
                            .subscribe((val) => {
                                this.notify.success(this.l('SavedSuccessfully'));
                            });
                    },
                });

                break;
            case 'Copy':
                this._examTemplatesServiceProxy.copyTemplate(record.examTemplate.id).subscribe((val) => {
                    this.getList();
                });

                break;
            case 'Delete':
                this._examTemplatesServiceProxy.delete(record.question.id).subscribe((val) => {
                    this.getList();
                });
                break;
        }
    }
    closeFilters() {
        this.FiltersComponent.isPanelOpen = false;
    }

    CopyTemplate() {
        this._DialogSharedService.showDialog(this.Copy_Template_dialog, {});
    }
}
