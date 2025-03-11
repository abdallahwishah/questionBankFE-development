import { Component, Injector, OnInit } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { CommonModule, Location } from '@node_modules/@angular/common';
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
    SubQuestionAnswer,
    UpdateScoreReqDto,
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
    loading = false;

    studentNumber;
    studentName;
    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
        private location: Location,
        private route: ActivatedRoute,
    ) {
        super(injector);
    }
    id: any;
    ngOnInit() {
        this.id = this._activatedRoute.snapshot.params.id;

        this.studentNumber = this._activatedRoute.snapshot.queryParams['studentNumber'];
        this.studentName = this._activatedRoute.snapshot.queryParams['studentName'];

        // Example of building questionType array if needed
        this.questionsType = Object.entries(QuestionTypeEnum)
            .filter(([_, value]) => typeof value === 'number')
            .map(([key, value]) => ({
                name: key,
                code: value,
            }));
        this.loading = true;
        // Load exam once
        this._examAttemptsServiceProxy.getAnswersByExamAttempt(this.id).subscribe((val) => {
            this.examForView = val;
            this.examForView?.forEach((value) => {
                this.handleQuestionWithAnswer(value);
            });
            console.log('examForView', this.examForView);
            this.loading = false;
        });
    }

    /**
     * Toggle the accordion for a specific section index.
     */
    toggleAccordion(index: number): void {
        this.openSections[index] = !this.openSections[index];
    }

    handleQuestionWithAnswer(questionWithAnswer: any) {
        let type: QuestionTypeEnum = questionWithAnswer?.question?.question?.type;
        let answer: any = {};

        switch (type) {
            case QuestionTypeEnum.MutliChoice:
                answer.multipleChoiceAnswer = questionWithAnswer?.optionId;
                break;
            case QuestionTypeEnum.SinglChoice:
                answer.singleChoiceAnswer = questionWithAnswer?.optionId?.[0];
                break;
            case QuestionTypeEnum.TrueAndFalse:
                answer.trueFalseAnswer = questionWithAnswer?.optionId?.[0];
                break;
            case QuestionTypeEnum.SA:
                answer.saAnswer = questionWithAnswer?.value?.[0];
                break;
            case QuestionTypeEnum.LinkedQuestions:
                console.log('questionWithAnswer', questionWithAnswer);
                // reorder questionWithAnswer?.linkedQuestionsSubAnswers as per linkedQuestions
                let linkedQuestionsSubAnswersOrdered = questionWithAnswer?.linkedQuestionsSubAnswers?.sort(
                    (a: any, b: any) => {
                        return (
                            questionWithAnswer?.question?.linkedQuestions.findIndex(
                                (x: any) => x.question.id === a.subQuestionId,
                            ) -
                            questionWithAnswer?.question?.linkedQuestions.findIndex(
                                (x: any) => x.question.id === b.subQuestionId,
                            )
                        );
                    },
                );
                answer.linkedQuestionAnswer = linkedQuestionsSubAnswersOrdered?.map((x: any, i) => {
                    let typex: QuestionTypeEnum = questionWithAnswer?.question?.linkedQuestions[i]?.question?.type;
                    let subAnswer: any = {};
                    subAnswer.isAnswerCorect = x?.isAnswerCorect;
                    switch (typex) {
                        case QuestionTypeEnum.MutliChoice:
                            subAnswer.multipleChoiceAnswer = x.optionId;
                            break;
                        case QuestionTypeEnum.SinglChoice:
                            subAnswer.singleChoiceAnswer = x.optionId?.[0];
                            break;
                        case QuestionTypeEnum.TrueAndFalse:
                            subAnswer.trueFalseAnswer = x.optionId?.[0];
                            break;
                        case QuestionTypeEnum.SA:
                            subAnswer.saAnswer = x.value;
                            break;
                        case QuestionTypeEnum.Match:
                            subAnswer.matchAnswer = x.matchValue;
                            break;
                        case QuestionTypeEnum.DargingTable:
                            subAnswer.dragTableAnswer = x.dargTableQuestionsSubAnswersWithoutPinned;
                            break;
                    }

                    return new SubQuestionAnswer({
                        questionId: x.subQuestionId,
                        ...subAnswer,
                    });
                });
                break;
        }

        questionWithAnswer.question = {
            ...questionWithAnswer?.question,
            ...answer,
        };
    }
    Save() {
        this._examAttemptsServiceProxy
            .updateScoreAll(
                this.examForView?.map((value) => {
                    return new UpdateScoreReqDto({
                        id: undefined,
                        score: value.score,
                        questionId: value?.question?.question?.id,
                        examAttemptId: this.id,
                        subId: undefined,
                    });
                }),
            )
            .subscribe((value) => {
                this.location.back();
            });
    }
}
