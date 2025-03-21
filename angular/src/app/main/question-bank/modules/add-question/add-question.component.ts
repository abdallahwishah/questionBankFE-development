import { ActivatedRoute, Router } from '@angular/router';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';

import {
    CategoriesServiceProxy,
    ComplexitiesServiceProxy,
    QuestionTypeEnum,
    CreateOrEditQuestionDto,
    QuestionsServiceProxy,
    QuestionPayloadDto,
} from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-question',
    templateUrl: './add-question.component.html',
    styleUrls: ['./add-question.component.css'],
})
export class AddQuestionComponent extends AppComponentBase implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    filter: string;
    questionsType: any[] = [];
    complexities: any[] = [];
    categories: any[] = [];
    checkedExplanatoryNote: boolean = true;
    QuestionTypeEnum = QuestionTypeEnum;
    _createOrEditQuestionDto = new CreateOrEditQuestionDto({
        ...new CreateOrEditQuestionDto(),
        payload: new QuestionPayloadDto({
            ...new QuestionPayloadDto(),
            subQuestions: [],
        }),
    });
    loading = false;
    studyLevelsValue: any[] = [];
    studySubject: any;
    studyUnit: any;

    constructor(
        private _injector: Injector,
        private _questionsServiceProxy: QuestionsServiceProxy,

        private _complexitiesServiceProxy: ComplexitiesServiceProxy,
        private _categoriesServiceProxy: CategoriesServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        super(_injector);
    }
    id;
    ngOnInit(): void {
        this.loading = true;

        // Load route params once here
        this.id = this._activatedRoute.snapshot.params.id;

        // Use forkJoin to get all references in parallel
        forkJoin([
            this._complexitiesServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined),
            this._categoriesServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined),
        ]).subscribe({
            next: ([complexitiesRes, categoriesRes]) => {
                // Map each response to your arrays

                this.complexities = complexitiesRes.items.map((item) => ({
                    id: item.complexity.id,
                    name: item.complexity.name,
                }));

                this.categories = categoriesRes.items.map((item) => ({
                    id: item.category.id,
                    name: item.category.name,
                }));

                // If we have an ID, load the question for edit
                if (this.id) {
                    this.getForEdit(this.id);
                } else {
                    // If there's no ID, just stop loading
                    this.loading = false;
                }
            },
            error: (err) => {
                // Handle error if needed
                this.loading = false;
            },
        });
    }

    getForEdit(id: number): void {
        this.loading = true;
        this._questionsServiceProxy.getQuestionForEdit(id).subscribe({
            next: (val) => {
                this._createOrEditQuestionDto = val.question;
                this.studyLevelsValue = this._createOrEditQuestionDto.studyLevelIds.map((x, i) => {
                    return {
                        studyLevel: {
                            name: val.studyLevelName[i],
                            id: x,
                        },
                    };
                });
                this.studySubject = {
                    studySubject: {
                        name: val.studySubjectName,
                        id: val.question.studySubjectId,
                    },
                };
                this.studyUnit = {
                    subjectUnit: {
                        name: val.subjectUnitName,
                        id: val.question.subjectUnitId,
                    },
                };
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
            },
        });
    }
    changeType() {
        // if (this._createOrEditQuestionDto.type == QuestionTypeEnum.LinkedQuestions) {
        //     this._createOrEditQuestionDto.payload = new QuestionPayloadDto({
        //         ...new QuestionPayloadDto(),
        //         subQuestions: [new CreateOrEditQuestionDto()],
        //     });
        // }
    }
    addNewLinledQ() {
        this._createOrEditQuestionDto.payload.subQuestions.push(new CreateOrEditQuestionDto());
    }
    removeLinkQ(index) {
        this._createOrEditQuestionDto.payload.subQuestions.splice(index, 1);
    }
    Save(): void {
        this._createOrEditQuestionDto.studyLevelIds = this.studyLevelsValue.map((x) => x?.studyLevel?.id);
        this._createOrEditQuestionDto.studySubjectId = this.studySubject.studySubject.id;
        this._createOrEditQuestionDto.subjectUnitId = this.studyUnit.subjectUnit.id;
        if (this._createOrEditQuestionDto?.payload?.subQuestions?.length) {
            this._createOrEditQuestionDto.payload.subQuestions.forEach((x) => {
                delete x.id;
            });
        }
        this._questionsServiceProxy.createOrEdit(this._createOrEditQuestionDto).subscribe({
            next: () => {
                this.notify.success(this.l('SavedSuccessfully'));
                this._router.navigate(['app/main/question-bank']);
            },
        });
    }
    get studyLevelIds() {
        return this.studyLevelsValue?.map((x) => x?.studyLevel?.id);
    }
    reset() {
        this._createOrEditQuestionDto = new CreateOrEditQuestionDto({
            ...new CreateOrEditQuestionDto(),
            payload: new QuestionPayloadDto({
                ...new QuestionPayloadDto(),
                subQuestions: [],
            }),
        });
        this.studyLevelsValue = [];
        this.studySubject = null;
        this.studyUnit = null;

    }
}
