import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { LazyLoadEvent } from '@node_modules/primeng/api';
import { Paginator } from '@node_modules/primeng/paginator';
import { Table } from '@node_modules/primeng/table';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CategoriesServiceProxy, ComplexitiesServiceProxy, QuestionTypeEnum, StudyLevelsServiceProxy, StudySubjectsServiceProxy, SubjectUnitsServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditQuestionDto } from '@shared/service-proxies/service-proxies';
import { QuestionsServiceProxy } from '@shared/service-proxies/service-proxies';

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
    checkedExplanatoryNote:boolean = true;
    QuestionTypeEnum = QuestionTypeEnum;
    _createOrEditQuestionDto = new CreateOrEditQuestionDto();
    constructor(
        private _injector: Injector,
        private _questionsServiceProxy: QuestionsServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,
        private _subjectUnitsServiceProxy:SubjectUnitsServiceProxy,
        private _complexitiesServiceProxy:ComplexitiesServiceProxy,
        private _categoriesServiceProxy:CategoriesServiceProxy,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this.getQuestion()
         this._studyLevelsServiceProxy.getAll(undefined , undefined , undefined ,undefined , undefined).subscribe(val=>{
            this.studyLevels = val.items.map(item => {
                return {
                  id: item.studyLevel.id,
                  name: item.studyLevel.name,
                };
              });
        })
        this._studySubjectsProxy.getAll(undefined , undefined , undefined ,undefined , undefined  , undefined).subscribe(val=>{
            this.studySubjects = val.items.map(item => {
                return {
                  id: item.studySubject.id,
                  name: item.studySubject.name,
                };
              });

        })
        this._subjectUnitsServiceProxy.getAll(undefined , undefined , undefined ,undefined , undefined  , undefined , undefined , undefined).subscribe(val=>{
            this.subjectUnits = val.items.map(item => {
                return {
                  id: item.subjectUnit.id,
                  name: item.subjectUnit.name,
                };
              });
        })
        this._complexitiesServiceProxy.getAll(undefined , undefined , undefined ,undefined , undefined).subscribe(val=>{
            this.complexities = val.items.map(item => {
                return {
                  id: item.complexity.id,
                  name: item.complexity.name,
                };
              });
        })
        this._categoriesServiceProxy.getAll(undefined , undefined , undefined ,undefined , undefined).subscribe(val=>{
            this.categories = val.items.map(item => {
                return {
                  id: item.category.id,
                  name: item.category.name,
                };
              });
        })
    }


     getQuestion(event?: LazyLoadEvent) {
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
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
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
                    console.log(result.items);
                    this.primengTableHelper.hideLoadingIndicator();
                });
     }


    Save(){
        this._questionsServiceProxy.createOrEdit(this._createOrEditQuestionDto).subscribe((val)=>{
            console.log("val :" , val)
        })
    }


    getCheckedExplanatoryNote($event){
        if(!$event.checked){
            this.checkedExplanatoryNote = false
        }else{
            this.checkedExplanatoryNote = true
        }
    }
}
