import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ComplexitiesServiceProxy, QuestionTypeEnum, StudyLevelsServiceProxy, StudySubjectsServiceProxy, SubjectUnitsServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditQuestionDto } from '@shared/service-proxies/service-proxies';
import { QuestionsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-question',
    templateUrl: './add-question.component.html',
    styleUrls: ['./add-question.component.css'],
})
export class AddQuestionComponent extends AppComponentBase implements OnInit {
    questionsType: any[] = [];
    studyLevels: any[] = [];
    studySubjects: any[] = [];
    subjectUnits: any[] = [];
    complexities: any[] = [];
    QuestionTypeEnum = QuestionTypeEnum;
    _createOrEditQuestionDto = new CreateOrEditQuestionDto();
    constructor(
        private _injector: Injector,
        private _questionsServiceProxy: QuestionsServiceProxy,
        private _studyLevelsServiceProxy: StudyLevelsServiceProxy,
        private _studySubjectsProxy: StudySubjectsServiceProxy,
        private _subjectUnitsServiceProxy:SubjectUnitsServiceProxy,
        private _complexitiesServiceProxy:ComplexitiesServiceProxy,
    ) {
        super(_injector);
    }

    ngOnInit() {
         this._createOrEditQuestionDto.body = 'test'
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
    }

    Save(){

        this._questionsServiceProxy.createOrEdit(this._createOrEditQuestionDto).subscribe((val)=>{
            console.log("val :" , val)
        })
    }
}
