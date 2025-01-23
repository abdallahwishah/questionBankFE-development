import { ActivatedRoute } from '@angular/router';
import { DynamicExamQuestionComponent } from '@app/shared/components/questions-exam/dynamic-exam-question/dynamic-exam-question.component';
import {
    ExamQuestionWithAnswerDto,
    ExamsServiceProxy,
    SubQuestionAnswer,
    ViewExamQuestionDto,
} from './../../../shared/service-proxies/service-proxies';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { AccordionModule } from 'primeng/accordion';
import { QuestionTypeEnum } from './../../../shared/service-proxies/service-proxies';

@Component({
    standalone: true,
    imports: [DynamicExamQuestionComponent, CommonModule, FormsModule, SidebarModule, AccordionModule],
    selector: 'app-exam-viewer-and-attempt',
    templateUrl: './exam-viewer-and-attempt.component.html',
    styleUrls: ['./exam-viewer-and-attempt.component.css'],
})
export class ExamViewerAndAttemptComponent implements OnInit {
    isViewer: boolean;
    id: number;
    examData: any;
    question: any;
    showInstructions = true;
    sidebarVisible = false;
    loading = false;

    private timer: any;
    remainingTime: string = '00 : 00 : 00';
    constructor(
        private _examsServiceProxy: ExamsServiceProxy,
        private _activatedRoute: ActivatedRoute,
    ) {
        this.isViewer = window?.location.href.includes('viewer');
        this.id = this._activatedRoute.snapshot.params.id;
    }

    ngOnInit() {
        this.loadExamData();
    }

    loadExamData() {
        if (this.isViewer) {
            this._examsServiceProxy.getApplyModel(this.id).subscribe((response) => {
                this.examData = response;
                this.question = response.questionWithAnswer.question;
                this.showInstructions = !!response.examInstructions;
            });
        } else {
            this._examsServiceProxy.getExpectedeExam().subscribe((response) => {
                this.examData = response.applyExamDto;
                this.id = response.applyExamDto.examId;
                this.handleQuestionWithAnswer(response.applyExamDto.questionWithAnswer);
                console.log('response.applyExamDto.questionWithAnswer', response.applyExamDto.questionWithAnswer);
                this.question = response.applyExamDto.questionWithAnswer.question;
                this.showInstructions = !!response.applyExamDto.examInstructions;
                this.startTimer(this.examData.remainingSeconds);
            });
        }
    }

    startExam() {
        this.showInstructions = false;
    }

    prev() {
        if (this.isViewer) {
            const viewDto = new ViewExamQuestionDto();
            viewDto.examId = this.id;
            viewDto.questionId = this.question.questionId;
            viewDto.questionNo = this.examData.questionNo - 1 || 1;
            viewDto.sectionId = this.question.sectionId;
            viewDto.sectionNo = this.examData.sectionNo;
            this.loading = true;

            this._examsServiceProxy.viewPreviosQuestion(viewDto).subscribe((response) => {
                this.updateQuestion(response);
            });
        } else {
            const dto = new ExamQuestionWithAnswerDto();
            dto.examId = this.id;
            dto.questionId = this.question.questionId;
            dto.questionNo = this.examData.questionNo - 1 || 1;
            dto.sectionId = this.question.sectionId;
            dto.sectionNo = this.examData.sectionNo;
            dto.type = this.question.question.type;
            dto.rearrangeAnswer = this.question.question?.rearrangeAnswer; //working
            dto.trueFalseAnswer = this.question.question?.trueFalseAnswer; //working
            dto.dragTableAnswer = this.question.question?.dragTableAnswer; //working
            dto.multipleChoiceAnswer = this.question.question?.multipleChoiceAnswer; //testing
            dto.drawingAnswer = this.question.question?.drawingAnswer; //working
            dto.singleChoiceAnswer = this.question.question?.singleChoiceAnswer; //working
            dto.matchAnswer = this.question.question?.matchAnswer; //working
            dto.saAnswer = this.question.question?.saAnswer; //working
            dto.dragFormAnswer = this.question.question?.dragFormAnswer;
            dto.linkedQuestionAnswer = this.question.question?.linkedQuestionAnswer; //working
            this.loading = true;

            this._examsServiceProxy.backQuestion(dto).subscribe((response) => {
                this.updateQuestion(response);
            });
        }
    }

    next() {
        if (this.isViewer) {
            const viewDto = new ViewExamQuestionDto();
            viewDto.examId = this.id;
            viewDto.questionId = this.question.questionId;
            viewDto.questionNo = this.examData.questionNo + 1;
            viewDto.sectionId = this.question.sectionId;
            viewDto.sectionNo = this.examData.sectionNo;
            this.loading = true;
            this._examsServiceProxy.viewNextQuestion(viewDto).subscribe((response) => {
                this.updateQuestion(response);
            });
        } else {
            const dto = new ExamQuestionWithAnswerDto();
            dto.examId = this.id;
            dto.questionId = this.question.questionId;
            dto.questionNo = this.examData.questionNo + 1;
            dto.sectionId = this.question.sectionId;
            dto.sectionNo = this.examData.sectionNo;
            dto.type = this.question.question.type;
            dto.rearrangeAnswer = this.question.question?.rearrangeAnswer;
            dto.trueFalseAnswer = this.question.question?.trueFalseAnswer;
            dto.dragTableAnswer = this.question.question?.dragTableAnswer;
            dto.multipleChoiceAnswer = this.question.question?.multipleChoiceAnswer;
            dto.drawingAnswer = this.question.question?.drawingAnswer;
            dto.singleChoiceAnswer = this.question.question?.singleChoiceAnswer;
            dto.matchAnswer = this.question.question?.matchAnswer;
            dto.saAnswer = this.question.question?.saAnswer;
            dto.dragFormAnswer = this.question.question?.dragFormAnswer;
            dto.linkedQuestionAnswer = this.question.question?.linkedQuestionAnswer;
            this.loading = true;

            this._examsServiceProxy.nextQuestion(dto).subscribe((response) => {
                this.updateQuestion(response);
            });
        }
    }

    startTimer(seconds: number) {
        let time = Math.floor(seconds);
        this.updateDisplay(time);

        this.timer = setInterval(() => {
            time--;
            if (time >= 0) {
                this.updateDisplay(time);
            } else {
                clearInterval(this.timer);
            }
        }, 1000);
    }

    updateDisplay(seconds: number) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        this.remainingTime = `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;
    }

    private updateQuestion(response: any) {
        this.handleQuestionWithAnswer(response);
        this.question = response.question;
        this.examData.questionNo = response.questionNo;
        this.examData.sectionNo = response.sectionNo;

        if (response.isNextSection) {
            this.examData.sectionInstructions = response.sectionInstructions;
        }
        this.loading = false;
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    handleQuestionWithAnswer(questionWithAnswer: any) {
        console.log('questionWithAnswer', questionWithAnswer);
        let type: QuestionTypeEnum = questionWithAnswer?.question?.question?.question?.type;
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
                answer.linkedQuestionAnswer = questionWithAnswer?.linkedQuestionsSubAnswers?.map((x: any, i) => {
                    let typex: QuestionTypeEnum =
                        questionWithAnswer?.question?.question?.linkedQuestions[i]?.question?.type;
                    let subAnswer: any = {};

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

        questionWithAnswer.question.question = {
            ...questionWithAnswer?.question?.question,
            ...answer,
        };
    }
}
