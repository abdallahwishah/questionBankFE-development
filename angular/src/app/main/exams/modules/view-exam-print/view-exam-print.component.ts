import { Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DynamicExamQuestionComponent } from '@app/shared/components/questions-exam/dynamic-exam-question/dynamic-exam-question.component';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { CommonModule, Location } from '@node_modules/@angular/common';
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
    @ViewChild('printSection') printSection: ElementRef;

    openSections: boolean[] = [];
    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
        private location: Location,
        private _activatedRoute: ActivatedRoute,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.spinnerService.show();

        this.printToPdf(this._activatedRoute.snapshot.params.id);
    }
    printToPdf(id: any) {
        // Load exam data first
        this._examsServiceProxy.getExamForView(id).subscribe((val) => {
            this.examForView = val;
            setTimeout(() => {
                this.spinnerService.hide();
            }, 1000);
            setTimeout(() => {
                this.location.back();
                window.print();
            }, 2000);
        });
    }
}
