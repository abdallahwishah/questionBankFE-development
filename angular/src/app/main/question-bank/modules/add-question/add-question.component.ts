import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { QuestionTypeEnum } from '@shared/service-proxies/service-proxies';
import { CreateOrEditQuestionDto } from '@shared/service-proxies/service-proxies';
import { QuestionsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-question',
    templateUrl: './add-question.component.html',
    styleUrls: ['./add-question.component.css'],
})
export class AddQuestionComponent extends AppComponentBase implements OnInit {
    questionsType: any[] = [];
    QuestionTypeEnum = QuestionTypeEnum;
    _createOrEditQuestionDto = new CreateOrEditQuestionDto();
    constructor(
        private _injector: Injector,
        private _questionsServiceProxy: QuestionsServiceProxy,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this._questionsServiceProxy.createOrEdit;

    }
}
