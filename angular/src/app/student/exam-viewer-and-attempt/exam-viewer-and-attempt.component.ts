import { ActivatedRoute } from '@angular/router';
import { DynamicExamQuestionComponent } from '@app/shared/components/questions-exam/dynamic-exam-question/dynamic-exam-question.component';
import {
    ExamQuestionWithAnswerDto,
    ExamsServiceProxy,
    ViewExamQuestionDto,
} from './../../../shared/service-proxies/service-proxies';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { AccordionModule } from 'primeng/accordion';

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
                this.question = response.applyExamDto.questionWithAnswer.question;
                this.showInstructions = !!response.applyExamDto.examInstructions;
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
            dto.questionNo = this.examData.questionNo - 1;
            dto.sectionId = this.question.sectionId;
            dto.sectionNo = this.examData.sectionNo;
            dto.type = this.question.question.type;
            dto.rearrangeAnswer = this.question.question?.rearrangeAnswer;//working
            dto.trueFalseAnswer = this.question.question?.trueFalseAnswer;//working
            dto.dragTableAnswer = this.question.question?.dragTableAnswer
            dto.multipleChoiceAnswer = this.question.question?.multipleChoiceAnswer
            dto.drawingAnswer = this.question.question?.drawingAnswer //working
            dto.singleChoiceAnswer = this.question.question?.singleChoiceAnswer  //working
            dto.matchAnswer = this.question.question?.matchAnswer //working
            dto.saAnswer = this.question.question?.saAnswer//working
            dto.dragFormAnswer = this.question.question?.dragFormAnswer
            dto.linkedQuestionAnswer = this.question.question?.linkedQuestionAnswer

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
            dto.dragTableAnswer = this.question.question?.dragTableAnswer
            dto.multipleChoiceAnswer = this.question.question?.multipleChoiceAnswer
            dto.drawingAnswer = this.question.question?.drawingAnswer
            dto.singleChoiceAnswer = this.question.question?.singleChoiceAnswer
            dto.matchAnswer = this.question.question?.matchAnswer
            dto.saAnswer = this.question.question?.saAnswer
            dto.dragFormAnswer = this.question.question?.dragFormAnswer
            dto.linkedQuestionAnswer = this.question.question?.linkedQuestionAnswer



            this._examsServiceProxy.nextQuestion(dto).subscribe((response) => {
                this.updateQuestion(response);
            });
        }
    }

    private updateQuestion(response: any) {
        this.question = response.question;
        this.examData.questionNo = response.questionNo;
        if (response.isNextSection) {
            this.examData.sectionNo = response.sectionNo;
            this.examData.sectionInstructions = response.sectionInstructions;
        }
        this.loading = false;
    }

    getRemainingTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(remainingSeconds).padStart(2, '0')}`;
    }
}
