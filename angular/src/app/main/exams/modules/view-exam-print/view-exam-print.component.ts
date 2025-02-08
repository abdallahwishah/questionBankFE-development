import { Component, Injector, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DynamicExamQuestionComponent } from '@app/shared/components/questions-exam/dynamic-exam-question/dynamic-exam-question.component';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { CommonModule } from '@node_modules/@angular/common';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ExamsServiceProxy, GetExamForViewDto, QuestionTypeEnum } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-view-exam-print',
    standalone: true,
    imports: [CommonModule, DynamicExamQuestionComponent, AppSharedModule],
    templateUrl: './view-exam-print.component.html',
    styleUrl: './view-exam-print.component.css',
})
export class ViewExamPrintComponent extends AppComponentBase implements OnInit {
    Add_View_exam_dialog = UniqueNameComponents.Add_View_exam_dialog;

    examForView: GetExamForViewDto;
    questionsType: any[] = [];

    QuestionTypeEnum = QuestionTypeEnum;

    openSections: boolean[] = [];
    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {}
    printToPdf(id: any) {
        // Load exam once
        this._examsServiceProxy.getExamForView(id).subscribe((val) => {
            this.examForView = val;

            setTimeout(() => {
                //  proccessToPrentPdf
            }, 500);
        });
    }
}
