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
    StudyLevelsServiceProxy,
    StudySubjectsServiceProxy,
    SubjectUnitsServiceProxy,
    CreateOrEditQuestionDto,
    QuestionsServiceProxy,
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
    studyLevels: any[] = [];
    studySubjects: any[] = [];
    subjectUnits: any[] = [];
    complexities: any[] = [];
    categories: any[] = [];
    checkedExplanatoryNote: boolean = true;
    QuestionTypeEnum = QuestionTypeEnum;
    _createOrEditQuestionDto = new CreateOrEditQuestionDto();
    loading = false;

    constructor(
        private _injector: Injector,
        private _questionsServiceProxy: QuestionsServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,
        private _subjectUnitsServiceProxy: SubjectUnitsServiceProxy,
        private _complexitiesServiceProxy: ComplexitiesServiceProxy,
        private _categoriesServiceProxy: CategoriesServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        super(_injector);
    }

    ngOnInit(): void {
        this.loading = true;

        // Load route params once here
        const id = this._activatedRoute.snapshot.params.id;

        // Use forkJoin to get all references in parallel
        forkJoin([
            this._studyLevelsServiceProxy.getAll(
                undefined, // filter
                undefined, // sorting
                undefined, // skipCount
                undefined, // maxResultCount
                undefined  // extra param
            ),
            this._studySubjectsProxy.getAll(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            ),
            this._subjectUnitsServiceProxy.getAll(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            ),
            this._complexitiesServiceProxy.getAll(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            ),
            this._categoriesServiceProxy.getAll(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            ),
        ]).subscribe({
            next: ([
                studyLevelsRes,
                studySubjectsRes,
                subjectUnitsRes,
                complexitiesRes,
                categoriesRes,
            ]) => {
                // Map each response to your arrays
                this.studyLevels = studyLevelsRes.items.map((item) => ({
                    id: item.studyLevel.id,
                    name: item.studyLevel.name,
                }));

                this.studySubjects = studySubjectsRes.items.map((item) => ({
                    id: item.studySubject.id,
                    name: item.studySubject.name,
                }));

                this.subjectUnits = subjectUnitsRes.items.map((item) => ({
                    id: item.subjectUnit.id,
                    name: item.subjectUnit.name,
                }));

                this.complexities = complexitiesRes.items.map((item) => ({
                    id: item.complexity.id,
                    name: item.complexity.name,
                }));

                this.categories = categoriesRes.items.map((item) => ({
                    id: item.category.id,
                    name: item.category.name,
                }));

                // If we have an ID, load the question for edit
                if (id) {
                    this.getForEdit(id);
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
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
            },
        });
    }

    Save(): void {
        this._questionsServiceProxy.createOrEdit(this._createOrEditQuestionDto).subscribe({
            next: () => {
                this.notify.success(this.l('SavedSuccessfully'));
                this._router.navigate(['app/main/question-bank/list']);
            },
        });
    }
}
