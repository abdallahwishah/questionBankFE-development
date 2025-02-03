import { Component, Injector, OnInit } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { CommonModule } from '@node_modules/@angular/common';
import { ActivatedRoute } from '@node_modules/@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    GetExamForViewDto,
    QuestionTypeEnum,
    ExamsServiceProxy,
    ExamQuestionDto,
    OrderMode,
    ReOrderExamQuestionDto,
    StudentsServiceProxy,
    SessionsServiceProxy,
    ExamAttemptsServiceProxy,
} from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-view-answers',
    templateUrl: './view-answers.component.html',
    styleUrls: ['./view-answers.component.css'],
})
export class ViewAnswersComponent extends AppComponentBase implements OnInit {
    examForView: any;
    questionsType: any[] = [];

    QuestionTypeEnum = QuestionTypeEnum;

    // Track which sections are open (for accordion)
    openSections: boolean[] = [];

    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _DialogSharedService: DialogSharedService,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
        const id = this._activatedRoute.snapshot.params.id;

        // Example of building questionType array if needed
        this.questionsType = Object.entries(QuestionTypeEnum)
            .filter(([_, value]) => typeof value === 'number')
            .map(([key, value]) => ({
                name: key,
                code: value,
            }));

        // Load exam once
        this._examAttemptsServiceProxy.getAnswersByExamAttempt(id).subscribe((val) => {
            this.examForView = val;

            // Initialize openSections for each examSection
            // if (this.examForView?.exam?.examSections) {
            //     this.openSections = this.examForView.exam.examSections.map(() => false);
            // }
        });
    }

    /**
     * Toggle the accordion for a specific section index.
     */
    toggleAccordion(index: number): void {
        this.openSections[index] = !this.openSections[index];
    }
}
