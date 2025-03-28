import {
    ExamsServiceProxy,
    StudyLevelsServiceProxy,
    StudySubjectsServiceProxy,
} from './../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { Router } from '@node_modules/@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { forkJoin } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { ViewExamPrintComponent } from '../view-exam-print/view-exam-print.component';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class ListComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild(FiltersComponent) FiltersComponent: FiltersComponent;

    Add_Test_dialog = UniqueNameComponents.Add_Test_dialog;
    studyLevels: any[] = [];
    studySubjects: any[] = [];
    loadingFilter = false;
    subjectId: number;
    levelId: number;

    filter: string;
    Add_File_dialog = UniqueNameComponents.Add_File_dialog;
    @ViewChild('printer') printer: ViewExamPrintComponent;
    constructor(
        private _injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _examsServiceProxy: ExamsServiceProxy,
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
    addFile() {
        this._DialogSharedService.showDialog(this.Add_File_dialog, {});
    }
    NumberOfModels=undefined
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

        this._examsServiceProxy
            .getAll(
                this.filter,
                undefined,
                undefined,
                this.NumberOfModels||undefined,
                this.levelId||undefined,
                this.subjectId||undefined,
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
            case 'View':
                this._router.navigate(['/student/exam-viewer/' + record.exam.id]);
                break;

            case 'Edit':
                this._router.navigate(['app/main/exams/view/' + record.exam.id]);
                break;
            case 'Delete':
                this._examsServiceProxy.delete(record.exam.id).subscribe((val) => {
                    this.getList();
                });
                break;
            case 'Print':
                this._router.navigate(['/printer-exam/' + record.exam.id]);

                break;
        }
    }

    closeFilters() {
        this.FiltersComponent.isPanelOpen = false;
    }

    AddExam() {
        this._DialogSharedService.showDialog(this.Add_Test_dialog, {});
    }

    clearFilter() {
        this.subjectId = undefined;
        this.levelId = undefined;
        this.getList();
    }
}
