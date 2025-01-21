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
    imports: [DynamicExamQuestionComponent, CommonModule, FormsModule , SidebarModule , AccordionModule],
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
        this._examsServiceProxy.getApplyModel(this.id).subscribe((response) => {
            this.examData = response;
            this.question = response.questionWithAnswer.question;
            console.log('questionquestion', this.question);
            this.showInstructions = !!response.examInstructions;
        });
    }

    startExam() {
        this.showInstructions = false;
    }

    prev() {
        if (this.isViewer) {
            const viewDto = new ViewExamQuestionDto();
            viewDto.examId = this.examData.examId;
            viewDto.questionId = this.question.question.id;
            viewDto.questionNo = this.question.questionNo;
            viewDto.sectionId = this.question.sectionId;
            viewDto.sectionNo = this.examData.sectionNo;

            this._examsServiceProxy.viewPreviosQuestion(viewDto).subscribe((response) => {
                this.updateQuestion(response);
            });
        } else {
            const answerDto = this.prepareAnswerDto();
            // this._examsServiceProxy.prevQuestion(answerDto).subscribe((response) => {
            //     this.updateQuestion(response);
            // });
        }
    }

    next() {
        if (this.isViewer) {
            const viewDto = new ViewExamQuestionDto();
            viewDto.examId = this.id;
            viewDto.questionId = this.question.questionId;
            viewDto.questionNo = this.examData.questionNo;
            viewDto.sectionId = this.question.sectionId;
            viewDto.sectionNo = this.examData.sectionNo;

            this._examsServiceProxy.viewNextQuestion(viewDto).subscribe((response) => {
                this.updateQuestion(response);
            });
        } else {
            const answerDto = this.prepareAnswerDto();
            this._examsServiceProxy.nextQuestion(answerDto).subscribe((response) => {
                this.updateQuestion(response);
            });
        }
    }

    private prepareAnswerDto(): ExamQuestionWithAnswerDto {
        const dto = new ExamQuestionWithAnswerDto();
        dto.examId = this.id;
        dto.questionNo = this.question.questionNo;
        dto.sectionId = this.question.sectionId;
        dto.sectionNo = this.examData.sectionNo;
        dto.type = this.question.question.type;
        return dto;
    }

    private updateQuestion(response: any) {
        this.question = response.question;
    }

    getRemainingTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(remainingSeconds).padStart(2, '0')}`;
    }
}
