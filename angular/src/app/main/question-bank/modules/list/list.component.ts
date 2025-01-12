import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { Router } from '@node_modules/@angular/router';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    QuestionsServiceProxy,
    QuestionTypeEnum,
    StudyLevelsServiceProxy,
    StudySubjectsServiceProxy,
} from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class ListComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    studyLevels: any[] = [];
    studySubjects: any[] = [];
    status = [
        {name: "فعال" , id:true},
        {name: "غير فعال" , id:false},
    ]

    Add_File_dialog = UniqueNameComponents.Add_File_dialog;
    filter: string;
    QuestionTypeEnum = QuestionTypeEnum;
    isActive:any;
    subjectId:number;
    levelId:number;
    typeFilter:number;
    questionTypeArray:any [] = [];
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


        console.log('klf , ', this.QuestionTypeEnum);
        this._studyLevelsServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined).subscribe((val) => {
            this.studyLevels = val.items.map((item) => {
                return {
                    id: item.studyLevel.id,
                    name: item.studyLevel.name,
                };
            });
        });
        this._studySubjectsProxy
            .getAll(undefined, undefined, undefined, undefined, undefined, undefined)
            .subscribe((val) => {
                this.studySubjects = val.items.map((item) => {
                    return {
                        id: item.studySubject.id,
                        name: item.studySubject.name,
                    };
                });
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

        this._questionsServiceProxy
            .getAll(
                this.filter,
                this.typeFilter || undefined,
                undefined,
                this.isActive || undefined,
                undefined,
                undefined,
                this.subjectId || undefined,
                this.levelId || undefined,
                undefined,
                undefined,
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event),
            )
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                console.log(result.items);
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    clearFilter(){
        this.typeFilter = undefined
        this.subjectId = undefined
        this.levelId = undefined
        this.getList()
    }

    addFile() {
        this._DialogSharedService.showDialog(this.Add_File_dialog, {});
    }

    CheckedQuestion: any;
    getCheckedQuestion(record) {
        record.question.isActive;
        // this._questionsServiceProxy.
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
