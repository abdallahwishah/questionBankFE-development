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
    QuestionsServiceProxy,
    QuestionTypeEnum,
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
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild(FiltersComponent) FiltersComponent: FiltersComponent;
    QuestionType:any
    studyLevels: any[] = [];
    studySubjects: any[] = [];
    status = [
        { name: 'All', id: undefined },
        { name: 'Active', id: true },
        { name: 'NoActive', id: false },
    ];

    filter: string;
    QuestionTypeEnum = QuestionTypeEnum;
    isActiveFilter: boolean;
    subjectId: any;
    levelId: any;
    typeFilter: number;
    loadingFilter: boolean = false;
    questionTypeArray: any[] = [];
    activeCount = 0;
    constructor(
        private _injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _questionsServiceProxy: QuestionsServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,

        private _router: Router,
    ) {
        super(_injector);
    }

    ngOnInit() {
        /* Covert Enum To array */
        this.questionTypeArray = Object.keys(QuestionTypeEnum)
            .filter((key) => isNaN(Number(key)))
            .map((key) => ({
                name: key,
                id: QuestionTypeEnum[key as keyof typeof QuestionTypeEnum],
            }));

        // Use forkJoin to get all references in parallel
        // forkJoin([
        //     this._studyLevelsServiceProxy.getAll(
        //         undefined, // filter
        //         undefined, // sorting
        //         undefined, // skipCount
        //         undefined, // maxResultCount
        //         undefined, // extra param
        //     ),
        //     this._studySubjectsProxy.getAll(
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //     ),
        // ]).subscribe({
        //     next: ([studyLevelsRes, studySubjectsRes]) => {
        //         // Map each response to your arrays
        //         this.studyLevels = studyLevelsRes.items.map((item) => ({
        //             id: item.studyLevel.id,
        //             name: item.studyLevel.name,
        //         }));

        //         this.studySubjects = studySubjectsRes.items.map((item) => ({
        //             id: item.studySubject.id,
        //             name: item.studySubject.name,
        //         }));
        //     },
        //     error: (err) => {
        //         // Handle error if needed
        //         this.loadingFilter = false;
        //     },
        // });
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

        this._questionsServiceProxy
            .getAll(
                this.filter,
                this.typeFilter || undefined,
                undefined,
                this.isActiveFilter,
                undefined,
                undefined,
                undefined,
                this.subjectId?.studySubject?.id|| undefined,
                this.levelId?.studyLevel?.id || undefined,
                undefined,
                undefined,
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
            )
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.activeCount = result.activeCount;
                this.primengTableHelper.records = result.items;
                this.isActiveFilter = undefined;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    clearFilter() {
        this.typeFilter = undefined;
        this.subjectId = undefined;
        this.levelId = undefined;
        this.getList();
    }
    cleaerStatusFilter() {
        this.isActiveFilter = undefined;
        this.getList();
    }


    CheckedQuestion: any;
    changeStatus($event, record) {
        this._questionsServiceProxy.updateQuestionStatus(record.question.id, $event.checked).subscribe((val) => {});
    }
    closeFilters() {
        this.FiltersComponent.isPanelOpen = false;
    }

    doActions(label: any, record: any) {
        switch (label) {
            case 'Edit':
                this._router.navigate(['app/main/question-bank/addQuestion/' + record.question.id]);
                break;
            case 'Delete':
                this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
                    if (isConfirmed) {
                        this._questionsServiceProxy.delete(record.question.id).subscribe((val) => {
                            this.getList();
                        });
                    }
                });

                break;
        }
    }
}
