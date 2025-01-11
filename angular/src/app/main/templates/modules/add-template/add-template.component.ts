import { Component, Injector, OnInit } from '@angular/core';
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
} from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-template',
    templateUrl: './add-template.component.html',
    styleUrls: ['./add-template.component.css'],
})
export class AddTemplateComponent extends AppComponentBase implements OnInit {
    // Main DTO for create/edit
    _createOrEditExamTemplateDto = new CreateOrEditExamTemplateDto();

    // For toggling main instructions (if needed)
    checked: boolean = true;

    // For question-type enum
    QuestionTypeEnum = QuestionTypeEnum;

    // Arrays for dropdowns (populated in ngOnInit)
    subjectUnits: any[] = [];
    categories: any[] = [];
    complexities: any[] = []; // This is what we'll use to generate dynamic columns

    // Example arrays for other dropdowns
    studySubjects: any[] = [];
    studyLevels: any[] = [];

    // Example: Could be used for "section order" if you like
    questionsType: any[] = [];

    constructor(
        injector: Injector,
        private _examTemplatesServiceProxy: ExamTemplatesServiceProxy,
        private _subjectUnitsServiceProxy: SubjectUnitsServiceProxy,
        private _complexitiesServiceProxy: ComplexitiesServiceProxy,
        private _categoriesServiceProxy: CategoriesServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        // Initialize sections array
        this._createOrEditExamTemplateDto.templateSections = [];

        // Load subject units
        this._subjectUnitsServiceProxy
            .getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)
            .subscribe((val) => {
                this.subjectUnits = val.items.map((item) => {
                    return {
                        id: item.subjectUnit.id,
                        name: item.subjectUnit.name,
                    };
                });
            });

        // Load complexities
        this._complexitiesServiceProxy
            .getAll(undefined, undefined, undefined, undefined, undefined)
            .subscribe((val) => {
                this.complexities = val.items.map((item) => {
                    return {
                        id: item.complexity.id,
                        name: item.complexity.name,
                    };
                });
            });

        // Load categories
        this._categoriesServiceProxy.getAll(undefined, undefined, undefined, undefined, undefined).subscribe((val) => {
            this.categories = val.items.map((item) => {
                return {
                    id: item.category.id,
                    name: item.category.name,
                };
            });
        });

        // If you need studySubjects / studyLevels, load them similarly
        // this.studySubjects = [...];
        // this.studyLevels = [...];
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

    // If you need to track p-inputSwitch for main instructions
    getChecked($event: any) {
        this.checked = !!$event.checked;
        this._createOrEditExamTemplateDto.hasInstructions = this.checked;
    }

    // Add new section
    addNewSection(): void {
        const newSection = new CreateOrEditTemplateSectionDto();
        newSection.id = undefined;
        newSection.name = ''; // SectionName
        newSection.durationTime = 0; // "Time"
        // If you want "SectionOrder" to be text, you can store a string
        // in the .order property. For clarity, let's keep .order as number or string:
        (newSection as any).order = ''; // Store as string for demonstration
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
            item.complexity = comp.id; // store the complexity ID
            item.number = 0; // user types how many questions for that complexity
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
