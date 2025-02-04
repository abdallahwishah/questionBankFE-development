import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ExamsServiceProxy,
    GetExamForViewDto,
    QuestionTypeEnum,
    ExamQuestionDto,
    ReOrderExamQuestionDto,
    OrderMode
} from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-view-exam',
    templateUrl: './view-exam.component.html',
    styleUrls: ['./view-exam.component.css'],
})
export class ViewExamComponent extends AppComponentBase implements OnInit {
    Add_View_exam_dialog = UniqueNameComponents.Add_View_exam_dialog;

    examForView: GetExamForViewDto;
    questionsType: any[] = [];

    QuestionTypeEnum=QuestionTypeEnum

    // Track which sections are open (for accordion)
    openSections: boolean[] = [];

    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _DialogSharedService: DialogSharedService,

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
        this._examsServiceProxy.getExamForView(id).subscribe((val) => {
            this.examForView = val;

            // Initialize openSections for each examSection
            if (this.examForView?.exam?.examSections) {
                this.openSections = this.examForView.exam.examSections.map(() => false);
            }
        });
    }

    /**
     * Toggle the accordion for a specific section index.
     */
    toggleAccordion(index: number): void {
        this.openSections[index] = !this.openSections[index];
    }

    /**
     * Delete an exam section on the server, then remove it locally
     * so we don't reload from the server.
     */
    deleteExamSection(sectionId: number | undefined, sectionIndex: number): void {
        if (!sectionId) return;

        this.message.confirm(this.l('AreYouSure'),'', (isConfirmed) => {
            if (isConfirmed) {
                this._examsServiceProxy.deleteExamSection(sectionId).subscribe(() => {
                    this.notify.success(this.l('SuccessfullyDeleted'));
                    // Remove locally
                    this.examForView.exam.examSections.splice(sectionIndex, 1);
                    // Also remove accordion open/close state
                    this.openSections.splice(sectionIndex, 1);
                });
            }
        });
    }

    /**
     * Delete a question on the server, then remove it locally from the specified section.
     */
    deleteExamQuestion(questionId: number | undefined, sectionIndex: number, questionIndex: number): void {
        if (!questionId) return;

        this.message.confirm(this.l('AreYouSure'), '',(isConfirmed) => {
            if (isConfirmed) {
                this._examsServiceProxy.deleteExamQuestion(questionId).subscribe(() => {
                    this.notify.success(this.l('SuccessfullyDeleted'));
                    // Remove question locally
                    const questions = this.examForView.exam.examSections[sectionIndex].examQuestions;
                    questions.splice(questionIndex, 1);
                });
            }
        });
    }

    /**
     * Reorder a question up or down. We call the service, then reorder locally.
     * mode = 1 => Down, 2 => Up (based on your enum).
     */
    reOrderQuestion(question: ExamQuestionDto, mode: OrderMode, sectionIndex: number, questionIndex: number): void {
        if (!question || !question.id) return;

        // Prepare request body
        const body = new ReOrderExamQuestionDto();
        body.questionId = question.questionId;
        body.order = question.order; // current order (if needed by backend)
        body.sectionId = question.sectionId;
        body.mode = mode; // 1 => Down, 2 => Up

        this._examsServiceProxy.reOrderQuestion(body).subscribe(() => {
            this.notify.success(this.l('SuccessfullyReordered'));

            // Reorder locally in the array
            const questions = this.examForView.exam.examSections[sectionIndex].examQuestions;

            // Make sure questionIndex is valid
            if (questionIndex < 0 || questionIndex >= questions.length) return;

            if (mode === OrderMode.Up && questionIndex > 0) {
                // Swap with the previous item
                const temp = questions[questionIndex];
                questions[questionIndex] = questions[questionIndex - 1];
                questions[questionIndex - 1] = temp;
            } else if (mode === OrderMode.Down && questionIndex < questions.length - 1) {
                // Swap with the next item
                const temp = questions[questionIndex];
                questions[questionIndex] = questions[questionIndex + 1];
                questions[questionIndex + 1] = temp;
            }

            // Optionally adjust question.order or recalc orders as needed
            // e.g., you might want to keep them sequential 1..n after reorder
        });
    }
    examSectionId
    addNewQ(examSectionId){
        this.examSectionId=examSectionId
        this._DialogSharedService.showDialog(this.Add_View_exam_dialog , {})
    }
}
