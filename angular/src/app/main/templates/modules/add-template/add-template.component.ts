import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs'; // <— for parallel requests
import { AppComponentBase } from '@shared/common/app-component-base';

import {
    ExamTemplatesServiceProxy,
    SubjectUnitsServiceProxy,
    ComplexitiesServiceProxy,
    CategoriesServiceProxy,
    CreateOrEditExamTemplateDto,
    CreateOrEditTemplateSectionDto,
    CreateSectionDifficultyCriteriaDto,
    CreateComplexityItemDto,
    QuestionTypeEnum,
    StudyLevelsServiceProxy,
    StudySubjectsServiceProxy,
    TemplateTypeEnum,
    SectionTypeEnum,
} from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-template',
    templateUrl: './add-template.component.html',
    styleUrls: ['./add-template.component.css'],
})
export class AddTemplateComponent extends AppComponentBase implements OnInit {
    // Main DTO for create/edit
    _createOrEditExamTemplateDto = new CreateOrEditExamTemplateDto();

    // For toggling main instructions
    checked: boolean = true;

    // For question-type enum
    QuestionTypeEnum = QuestionTypeEnum;

    // Arrays for dropdowns (will be populated)
    subjectUnits: any[] = [];
    categories: any[] = [];
    complexities: any[] = [];
    studySubjects: any[] = [];
    studyLevels: any[] = [];

    // Additional arrays
    questionsType: any[] = [];
    TemplateTypes: any[] = [];

    SectionTypeEnum = SectionTypeEnum;

    loading = false;
    private templateId: number | undefined;

    constructor(
        injector: Injector,
        private _examTemplatesServiceProxy: ExamTemplatesServiceProxy,
        private _subjectUnitsServiceProxy: SubjectUnitsServiceProxy,
        private _complexitiesServiceProxy: ComplexitiesServiceProxy,
        private _categoriesServiceProxy: CategoriesServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsServiceProxy: StudySubjectsServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        super(injector);

        // Read params once in constructor or ngOnInit
        this._activatedRoute.params.subscribe((params) => {
            if (params?.id) {
                this.templateId = Number(params.id);
            }
        });
    }

    ngOnInit(): void {
        this.loading = true;

        // Use forkJoin to load everything in parallel
        forkJoin([
            this._subjectUnitsServiceProxy.getAll(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            ),
            this._complexitiesServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined),
            this._categoriesServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined),
            this._studyLevelsServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined),
            this._studySubjectsServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined, undefined),
        ]).subscribe(
            ([unitsRes, complexitiesRes, categoriesRes, levelsRes, subjectsRes]) => {
                // subject units
                this.subjectUnits = unitsRes.items.map((item) => ({
                    id: item.subjectUnit.id,
                    name: item.subjectUnit.name,
                }));

                // complexities
                this.complexities = complexitiesRes.items.map((item) => ({
                    id: item.complexity.id,
                    name: item.complexity.name,
                }));

                // categories
                this.categories = categoriesRes.items.map((item) => ({
                    id: item.category.id,
                    name: item.category.name,
                }));

                // study levels
                this.studyLevels = levelsRes.items.map((item) => ({
                    id: item.studyLevel.id,
                    name: item.studyLevel.name,
                }));

                // study subjects
                this.studySubjects = subjectsRes.items.map((item) => ({
                    id: item.studySubject.id,
                    name: item.studySubject.name,
                }));

                // Template types
                this.TemplateTypes = Object.entries(TemplateTypeEnum)
                    .filter(([key, value]) => typeof value === 'number')
                    .map(([key, value]) => ({
                        Name: key,
                        Code: value,
                    }));

                // If we are in "edit" mode, load the existing template now.
                // If not, add a new empty section.
                if (this.templateId) {
                    this._examTemplatesServiceProxy.getExamTemplateForEdit(this.templateId).subscribe((val) => {
                        this._createOrEditExamTemplateDto = val.examTemplate;
                        this.checked = this._createOrEditExamTemplateDto.hasInstructions ?? true;
                        this.loading = false;
                    });
                } else {
                    // "create" mode
                    this.addNewSection();
                    this.loading = false;
                }
            },
            (error) => {
                this.loading = false;
                // handle error if needed
            },
        );
    }

    // Track p-inputSwitch
    getChecked($event: any) {
        this.checked = !!$event.checked;
        this._createOrEditExamTemplateDto.hasInstructions = this.checked;
    }

    // Add new section
    addNewSection(): void {
        if (!this._createOrEditExamTemplateDto.templateSections) {
            this._createOrEditExamTemplateDto.templateSections = [];
        }

        const newSection = new CreateOrEditTemplateSectionDto();
        newSection.name = '';
        newSection.durationTime = 0;
        (newSection as any).order = ''; // store as string for demonstration
        newSection.instructions = '';
        newSection.difficultyCriteria = [];

        this._createOrEditExamTemplateDto.templateSections.push(newSection);
    }

    removeSection(index: number): void {
        this._createOrEditExamTemplateDto.templateSections.splice(index, 1);
    }

    // Add new row to difficultyCriteria in a specific section
    addNewDifficultyCriteria(section: CreateOrEditTemplateSectionDto): void {
        const newCriteria = new CreateSectionDifficultyCriteriaDto();
        newCriteria.questionType = QuestionTypeEnum.SinglChoice;
        newCriteria.subjectUnitId = undefined;
        newCriteria.categoryId = undefined;
        newCriteria.execludedPageNumber = '';

        // For dynamic complexities, each complexity becomes a CreateComplexityItemDto
        newCriteria.items = this.complexities.map((comp) => {
            const item = new CreateComplexityItemDto();
            item.complexity = comp.id;
            item.number = 0;
            return item;
        });

        section.difficultyCriteria.push(newCriteria);
    }

    removeDifficultyCriteria(section: CreateOrEditTemplateSectionDto, rowIndex: number): void {
        section.difficultyCriteria.splice(rowIndex, 1);
    }

    // Submit form
    createOrEditTemplate(): void {
        this._examTemplatesServiceProxy.createOrEdit(this._createOrEditExamTemplateDto).subscribe(() => {
            this.notify.success(this.l('SavedSuccessfully'));
            this._router.navigate(['app/main/templates']);

            this.resetForm();
        });
    }

    // Reset the form
    resetForm(): void {
        this._createOrEditExamTemplateDto = new CreateOrEditExamTemplateDto();
        this._createOrEditExamTemplateDto.templateSections = [];
        this.checked = true;
    }
}
