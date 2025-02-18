import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ApplyExamDto,
    ExamQuestionWithAnswerDto,
    ExamsServiceProxy,
    QuestionWithAnswerDto,
    StudentExamStatus,
    SubQuestionAnswer,
    QuestionTypeEnum,
    SubmitAnswerExamQuestionsDto,
} from './../../../shared/service-proxies/service-proxies';

import { AppComponentBase } from '@shared/common/app-component-base';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { DynamicExamQuestionComponent } from '@app/shared/components/questions-exam/dynamic-exam-question/dynamic-exam-question.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { AccordionModule } from 'primeng/accordion';
import { WarningModalComponent } from '@app/main/templates/components/warning-modal/warning-modal.component';
import { SafeTextPipe } from '@app/shared/pipes/safe-text.pipe';

@Component({
    standalone: true,
    imports: [
        DynamicExamQuestionComponent,
        CommonModule,
        FormsModule,
        SidebarModule,
        AccordionModule,
        WarningModalComponent,
        SafeTextPipe,
    ],
    selector: 'app-exam-viewer-and-attempt-bulk',
    templateUrl: './exam-viewer-and-attempt-bulk.component.html',
    styleUrls: ['./exam-viewer-and-attempt-bulk.component.css'],
})
export class ExamViewerAndAttemptBulkComponent extends AppComponentBase implements OnInit, OnDestroy {
    // Basic exam data
    examData: ApplyExamDto;
    questionlist: QuestionWithAnswerDto[] = [];
    currentIndex = 0;

    // UI / state
    showInstructions = true;
    sidebarVisible = false;
    loading = false;

    // Timer
    private timer: any = null;
    private remainingSeconds = 0; // We'll store the "seconds left" internally
    remainingTime: string = '00:00:00';

    // LocalStorage key
    private LOCAL_STORAGE_KEY = 'MY_EXAM_DATA_V2';

    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private router: Router,
        private _DialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }
    studentAttemptId;
    ngOnInit() {
        const savedDataJson = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (savedDataJson) {
            try {
                const saved = JSON.parse(savedDataJson);
                // re-hydrate
                this.examData = saved.examData;
                this.questionlist = saved.questionlist || [];
                this.currentIndex = saved.currentIndex || 0;
                this.showInstructions = saved.showInstructions ?? true;
                this.remainingTime = saved.remainingTime || '00:00:00';
                this.studentAttemptId = saved.studentAttemptId;
                // If we saved "remainingSeconds" explicitly, restore it:
                if (typeof saved.remainingSeconds === 'number') {
                    this.remainingSeconds = saved.remainingSeconds;
                    // If we still have time, let's re-start the timer:
                    if (this.remainingSeconds > 0) {
                        this.startTimer(this.remainingSeconds);
                    } else {
                        // If the user had 0 or less, we do final end or forced submission:
                        this.handleTimeExpired();
                    }
                }

                // If no examData in local storage, fetch from server
                if (!this.examData) {
                    this.loadExamData();
                }
            } catch (err) {
                // if parse fails, load fresh
                this.loadExamData();
            }
        } else {
            // no saved data => fetch from server
            this.loadExamData();
        }
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    // ----------------------------------------------------------
    // Loading from server if needed
    // ----------------------------------------------------------
    loadExamData() {
        this._examsServiceProxy.getExpectedeExam().subscribe((response) => {
            this.examData = response.applyExamDto;
            this.questionlist = response.examQuestions || [];
            this.studentAttemptId = response.studentAttemptId;
            if (!this.examData) {
                this.router.navigate(['/student/main']);
                return;
            }

            // If we have a "remainingSeconds" from server, store it
            if (this.examData.remainingSeconds) {
                this.remainingSeconds = Math.floor(this.examData.remainingSeconds);
                if (this.remainingSeconds > 0) {
                    this.startTimer(this.remainingSeconds);
                } else {
                    // zero or negative => time is up?
                    this.handleTimeExpired();
                }
            }

            this.showInstructions = !!this.examData.examInstructions;
            this.saveToLocalStorage();
        });
    }

    // ----------------------------------------------------------
    // Timer
    // ----------------------------------------------------------
    startTimer(seconds: number) {
        // store internally
        this.remainingSeconds = seconds;
        this.updateTimeDisplay(this.remainingSeconds);

        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            this.remainingSeconds--;
            if (this.remainingSeconds > 0) {
                this.updateTimeDisplay(this.remainingSeconds);
            } else {
                clearInterval(this.timer);
                this.remainingSeconds = 0;
                this.updateTimeDisplay(0);
                // Time is up => auto end exam
                this.handleTimeExpired();
            }
            // Save to local each tick
            this.saveToLocalStorage();
        }, 1000);
    }

    updateTimeDisplay(secs: number) {
        const hh = Math.floor(secs / 3600);
        const mm = Math.floor((secs % 3600) / 60);
        const ss = secs % 60;
        this.remainingTime = `${String(hh).padStart(2, '0')} : ${String(mm).padStart(
            2,
            '0',
        )} : ${String(ss).padStart(2, '0')}`;
    }

    private handleTimeExpired() {
        // If time is up, we want to do final submission
        this.saveAllAnswersToServer(true);
    }

    // ----------------------------------------------------------
    // localStorage
    // ----------------------------------------------------------
    private saveToLocalStorage() {
        const dataToStore = {
            examData: this.examData,
            questionlist: this.questionlist,
            currentIndex: this.currentIndex,
            showInstructions: this.showInstructions,
            remainingTime: this.remainingTime,
            remainingSeconds: this.remainingSeconds,
            studentAttemptId: this.studentAttemptId,
        };
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
    }

    private clearStorageAndRedirect() {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        this.router.navigate(['/student/main']);
    }

    // ----------------------------------------------------------
    // UI logic
    // ----------------------------------------------------------
    startExam() {
        this.showInstructions = false;
        this.saveToLocalStorage();
    }

    get currentQuestion(): QuestionWithAnswerDto | undefined {
        return this.questionlist[this.currentIndex];
    }

    get isFirstQuestion(): boolean {
        return this.currentIndex === 0;
    }
    get isLastQuestion(): boolean {
        return this.currentIndex === this.questionlist.length - 1;
    }

    prev() {
        this.loadContent();

        if (this.isFirstQuestion) return;
        // Immediately move in UI
        this.currentIndex--;
        this.saveToLocalStorage();

        // Try to sync in background
        this.saveAllAnswersToServer(false);
    }

    Warning_dialog = UniqueNameComponents.Warning_dialog;
    nextCon() {
        // show confirm if user tries to end exam
        this._DialogSharedService.showDialog(this.Warning_dialog, {
            confirm: () => {
                this.next(true);
            },
        });
    }
    loadContent() {
        this.loading = true;
        setTimeout(() => {
            this.loading = false;
        }, 500);
    }
    next(isLast = false) {
        this.loadContent();
        // Move in UI immediately (if not last or forcing last)
        if (!this.isLastQuestion || !isLast) {
            this.currentIndex++;
        }
        this.saveToLocalStorage();

        // sync in background
        this.saveAllAnswersToServer(isLast);
    }

    end() {
        // final end: remove local storage, go away
        this.clearStorageAndRedirect();
    }

    // ----------------------------------------------------------
    // Building + sending answers
    // ----------------------------------------------------------
    private saveAllAnswersToServer(isLast: boolean) {
        // If no examData or no questionlist loaded, skip
        if (!this.examData || !this.questionlist.length) return;

        const answersArray: ExamQuestionWithAnswerDto[] = this.buildAnswersArray();

        this._examsServiceProxy
            .answerExamQuestions(
                new SubmitAnswerExamQuestionsDto({
                    questionListWithAnswer: answersArray,
                    studentAttemptId: this.studentAttemptId || '', // or pass real ID
                    submitExam: isLast,
                }),
            )
            .subscribe({
                next: (res) => {
                    // if success, check exam status
                    switch (res.studentExamStatus) {
                        case StudentExamStatus.ReachedExamEnd:
                        case StudentExamStatus.StudentAlreadyFinished:
                        case StudentExamStatus.ExamAlreadyEnd:
                            // forcibly end the exam UI
                            this.end();
                            return;
                        case StudentExamStatus.SomethingWrong:
                            window.location.reload();
                            return;
                    }
                    // if isLast => end
                    if (isLast) {
                        this.end();
                    }
                },
                error: (err) => {
                    console.warn('Sync failed', err);
                    // user keeps working, we'll retry next time they navigate
                },
            });
    }

    private buildAnswersArray(): ExamQuestionWithAnswerDto[] {
        const examId = this.examData?.examId;
        return this.questionlist.map((q: any) => {
            const dto = new ExamQuestionWithAnswerDto();
            dto.examId = examId;
            dto.questionId = q.question.questionId;
            dto.questionNo = q.questionNo;
            dto.sectionId = q.sectionId;
            dto.sectionNo = q.sectionNo;
            dto.type = q.question?.question?.question?.type;

            switch (dto.type) {
                case QuestionTypeEnum.MutliChoice:
                    dto.multipleChoiceAnswer = q.question?.question?.question?.multipleChoiceAnswer;
                    break;
                case QuestionTypeEnum.SinglChoice:
                    dto.singleChoiceAnswer = q.question?.question?.question?.singleChoiceAnswer;
                    break;
                case QuestionTypeEnum.TrueAndFalse:
                    dto.trueFalseAnswer = q.question?.question?.question?.trueFalseAnswer;
                    break;
                case QuestionTypeEnum.SA:
                    dto.saAnswer = q.question?.question?.question?.saAnswer;
                    break;
                case QuestionTypeEnum.Match:
                    dto.matchAnswer = q.question?.question?.question?.matchAnswer;
                    break;
                case QuestionTypeEnum.LinkedQuestions:
                    const subs = q.question?.question?.linkedQuestionAnswer || [];
                    dto.linkedQuestionAnswer = subs.map((sub) => {
                        return new SubQuestionAnswer({
                            questionId: sub.questionId,
                            multipleChoiceAnswer: sub.multipleChoiceAnswer,
                            singleChoiceAnswer: sub.singleChoiceAnswer,
                            trueFalseAnswer: sub.trueFalseAnswer,
                            saAnswer: sub.saAnswer,
                            matchAnswer: sub.matchAnswer,
                        });
                    });
                    break;
                // etc for other question types
            }
            return dto;
        });
    }

    // from sidebar
    GetSelectedQuestion(index: number) {
        this.currentIndex = index;
        this.saveToLocalStorage();
        this.saveAllAnswersToServer(false);
        this.sidebarVisible = false;
    }
}
