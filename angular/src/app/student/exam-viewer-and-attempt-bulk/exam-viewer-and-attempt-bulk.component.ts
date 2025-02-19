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
interface LocalQuestion extends QuestionWithAnswerDto {
    isSynced?: boolean;
    sendFailed?: boolean;
    localDirty?: boolean;
}
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
    studentAttemptId: string;

    // Our question array with local flags
    questionlist: LocalQuestion[] | any = [];

    // current question index
    currentIndex = 0;

    // UI state
    showInstructions = true;
    sidebarVisible = false;
    loading = false;

    // Timer
    private timer: any = null;
    private remainingSeconds = 0;
    remainingTime: string = '00:00:00';

    // localStorage key
    private LOCAL_STORAGE_KEY = 'MY_EXAM_DATA_V2';

    // Warning dialog key
    Warning_dialog = UniqueNameComponents.Warning_dialog;

    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private router: Router,
        private _DialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }

    ngOnInit() {
        // Attempt to load from localStorage first
        const savedDataJson = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (savedDataJson) {
            try {
                const saved = JSON.parse(savedDataJson);

                this.examData = saved.examData;
                this.studentAttemptId = saved.studentAttemptId;
                this.questionlist = saved.questionlist || [];
                this.currentIndex = saved.currentIndex || 0;
                this.showInstructions = saved.showInstructions ?? true;
                this.remainingTime = saved.remainingTime || '00:00:00';
                this.remainingSeconds = saved.remainingSeconds || 0;

                // If we have remainingSeconds > 0, restart the timer
                if (this.remainingSeconds > 0) {
                    this.startTimer(this.remainingSeconds);
                } else if (this.remainingSeconds <= 0 && this.examData) {
                    // time up => final submission
                    this.handleTimeExpired();
                }

                // If no examData in localStorage => fetch from server
                if (!this.examData) {
                    this.loadExamData();
                }
            } catch (err) {
                // parse error => load fresh from server
                this.loadExamData();
            }
        } else {
            // If no data in local => fetch
            this.loadExamData();
        }
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    // --------------------------
    // LOAD EXAM from server if needed
    // --------------------------
    loadExamData() {
        this._examsServiceProxy.getExpectedeExam().subscribe((response) => {
            if (!response.applyExamDto) {
                this.router.navigate(['/student/main']);
                return;
            }
            this.examData = response.applyExamDto;
            this.studentAttemptId = response.studentAttemptId;

            // Convert raw question array into our LocalQuestion array
            this.questionlist = (response.examQuestions || []).map((q) => {
                return {
                    ...q,
                    isSynced: false,
                    sendFailed: false,
                    localDirty: false,
                };
            });

            // show instructions if exist
            this.showInstructions = !!this.examData.examInstructions;

            // We might have some "remainingSeconds" from the server
            // if so, store it in this.remainingSeconds and start timer
            // or handle is 0 => time up
            // (assuming the server's "remainingSeconds" is in applyExamDto)
            if (this.examData.remainingSeconds) {
                this.remainingSeconds = Math.floor(this.examData.remainingSeconds);
                if (this.remainingSeconds > 0) {
                    this.startTimer(this.remainingSeconds);
                } else {
                    this.handleTimeExpired();
                }
            }

            this.saveToLocalStorage();
        });
    }

    // Re-calc time if the server returns new "remainingSeconds" after partial sync
    reCalTime() {
        if (this.examData.remainingSeconds) {
            this.remainingSeconds = Math.floor(this.examData.remainingSeconds);
            if (this.remainingSeconds > 0) {
                this.startTimer(this.remainingSeconds);
            } else {
                this.handleTimeExpired();
            }
        }
    }

    // --------------------------
    // localStorage
    // --------------------------
    private saveToLocalStorage() {
        const dataToStore = {
            examData: this.examData,
            studentAttemptId: this.studentAttemptId,
            questionlist: this.questionlist,
            currentIndex: this.currentIndex,
            showInstructions: this.showInstructions,
            remainingTime: this.remainingTime,
            remainingSeconds: this.remainingSeconds,
        };
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
    }

    private clearStorageAndRedirect() {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        this.router.navigate(['/student/main']);
    }

    // --------------------------
    // Timer
    // --------------------------
    startTimer(seconds: number) {
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
                this.handleTimeExpired();
            }
            this.saveToLocalStorage();
        }, 1000);
    }

    updateTimeDisplay(secs: number) {
        const hh = Math.floor(secs / 3600);
        const mm = Math.floor((secs % 3600) / 60);
        const ss = secs % 60;
        this.remainingTime = `${String(hh).padStart(2, '0')} : ${String(mm).padStart(2, '0')} : ${String(ss).padStart(2, '0')}`;
    }

    private handleTimeExpired() {
        this.end();
    }

    // --------------------------
    // UI / Navigation
    // --------------------------
    startExam() {
        this.showInstructions = false;
        this.saveToLocalStorage();
    }

    get currentQuestion(): LocalQuestion | undefined {
        return this.questionlist[this.currentIndex];
    }

    get isFirstQuestion(): boolean {
        return this.currentIndex === 0;
    }
    get isLastQuestion(): boolean {
        return this.currentIndex === this.questionlist.length - 1;
    }

    prev() {
        this.onUserChangedAnswer(this.currentIndex);
        this.loadContent();
        this.checkAnswered();

        if (this.isFirstQuestion) return;
        this.currentIndex--;
        this.saveToLocalStorage();

        // partial sync => current + failed
        this.saveSomeAnswersToServer(false);
    }

    nextCon() {
        // show confirm if user tries to end
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
        this.onUserChangedAnswer(this.currentIndex);
        this.loadContent();
        this.checkAnswered();
        if (!this.isLastQuestion || !isLast) {
            this.currentIndex++;
        }
        this.saveToLocalStorage();
        // partial sync => current + failed
        this.saveSomeAnswersToServer(isLast);
    }
    checkAnswered() {
        let dto = this.buildOneAnswer(this.currentQuestion);
        if (
            !dto.rearrangeAnswer &&
            !dto.trueFalseAnswer &&
            !dto.dragTableAnswer &&
            !dto.multipleChoiceAnswer &&
            !dto.drawingAnswer &&
            !dto.singleChoiceAnswer &&
            !dto.matchAnswer &&
            !dto.saAnswer &&
            !dto.dragFormAnswer &&
            !dto.linkedQuestionAnswer
        ) {
            alert('يرجى تقديم إجابة قبل المتابعة.');
            this.loading = false;
            return;
        }
        if (dto.linkedQuestionAnswer) {
            // check requird for sub
            const hasAnswer = dto.linkedQuestionAnswer.every(
                (subAnswer: any) =>
                    subAnswer.multipleChoiceAnswer ||
                    subAnswer.singleChoiceAnswer ||
                    subAnswer.trueFalseAnswer ||
                    subAnswer.saAnswer ||
                    subAnswer.matchAnswer ||
                    subAnswer.dragTableAnswer,
            );

            if (!hasAnswer) {
                alert('يرجى تقديم إجابة لكل سؤال فرعي قبل المتابعة.');
                this.loading = false;
                return;
            }
        }
    }
    end() {
        this.clearStorageAndRedirect();
    }

    // from sidebar
    GetSelectedQuestion(index: number) {
        this.currentIndex = index;
        this.loadContent();

        this.saveToLocalStorage();
        // partial sync => current + failed
        this.saveSomeAnswersToServer(false);
        this.sidebarVisible = false;
    }

    // Called whenever user changes an answer => mark it localDirty
    onUserChangedAnswer(index: number) {
        const q = this.questionlist[index];
        q.localDirty = true;
        q.isSynced = false;
        this.saveToLocalStorage();
    }

    // --------------------------
    // PARTIAL SYNC: send only current + previously failed
    // --------------------------
    private saveSomeAnswersToServer(isLast: boolean) {
        if (!this.examData || !this.questionlist.length) return;

        // Build array for:
        // 1) Current question if (localDirty == true OR sendFailed == true)
        // 2) Any question that had sendFailed == true
        const toSend = this.questionlist
            .filter((q, idx) => q.sendFailed || q.localDirty)
            .map((q) => this.buildOneAnswer(q));

        this._examsServiceProxy
            .answerExamQuestions(
                new SubmitAnswerExamQuestionsDto({
                    questionListWithAnswer: toSend,
                    studentAttemptId: this.studentAttemptId || '',
                    submitExam: isLast,
                }),
            )
            .subscribe({
                next: (res) => {
                    switch (res.studentExamStatus) {
                        case StudentExamStatus.ReachedExamEnd:
                        case StudentExamStatus.StudentAlreadyFinished:
                        case StudentExamStatus.ExamAlreadyEnd:
                            this.end();
                            return;
                        case StudentExamStatus.SomethingWrong:
                            window.location.reload();
                            return;
                    }
                    // success => mark them as synced
                    toSend.forEach((dto) => {
                        const idx = this.questionlist.findIndex((x) => x.question.questionId === dto.questionId);
                        if (idx >= 0) {
                            this.questionlist[idx].isSynced = true;
                            this.questionlist[idx].localDirty = false;
                            this.questionlist[idx].sendFailed = false;
                        }
                    });

                    // update time
                    this.examData.remainingSeconds = res.remainingTimeInSecond;
                    this.reCalTime();

                    if (isLast) {
                        this.end();
                    } else {
                        this.saveToLocalStorage();
                    }
                },
                error: (err) => {
                    console.warn('Sync partial failed', err);
                    // mark them as failed
                    toSend.forEach((dto) => {
                        const idx = this.questionlist.findIndex((x) => x.question.questionId === dto.questionId);
                        if (idx >= 0) {
                            this.questionlist[idx].sendFailed = true;
                        }
                    });
                    this.saveToLocalStorage();
                },
            });
    }

    // --------------------------
    // FULL SYNC: used if time up or final submission
    // --------------------------
    private saveAllAnswersToServer(isLast: boolean) {
        if (!this.examData || !this.questionlist.length) return;

        const allAnswers = this.questionlist.map((q) => this.buildOneAnswer(q));
        this._examsServiceProxy
            .answerExamQuestions(
                new SubmitAnswerExamQuestionsDto({
                    questionListWithAnswer: allAnswers,
                    studentAttemptId: this.studentAttemptId || '',
                    submitExam: isLast,
                }),
            )
            .subscribe({
                next: (res) => {
                    switch (res.studentExamStatus) {
                        case StudentExamStatus.ReachedExamEnd:
                        case StudentExamStatus.StudentAlreadyFinished:
                        case StudentExamStatus.ExamAlreadyEnd:
                            this.end();
                            return;
                        case StudentExamStatus.SomethingWrong:
                            window.location.reload();
                            return;
                    }
                    // success => mark all as synced
                    this.questionlist.forEach((x) => {
                        x.isSynced = true;
                        x.localDirty = false;
                        x.sendFailed = false;
                    });

                    this.examData.remainingSeconds = res.remainingTimeInSecond;
                    this.reCalTime();

                    if (isLast) {
                        this.end();
                    } else {
                        this.saveToLocalStorage();
                    }
                },
                error: (err) => {
                    console.warn('Sync all failed', err);
                    // mark all as failed
                    this.questionlist.forEach((x) => {
                        x.sendFailed = true;
                    });
                    this.saveToLocalStorage();
                },
            });
    }

    // Build a single question's answer
    private buildOneAnswer(q: any): ExamQuestionWithAnswerDto {
        const dto = new ExamQuestionWithAnswerDto();
        dto.examId = this.examData?.examId;
        dto.questionId = q.question.questionId;
        dto.questionNo = q.questionNo;
        dto.sectionId = q.sectionId;
        dto.sectionNo = q.sectionNo;
        dto.type = q.question?.question?.question?.type;

        // fill relevant answer property
        switch (dto.type) {
            case QuestionTypeEnum.MutliChoice:
                dto.multipleChoiceAnswer = q.question?.question?.multipleChoiceAnswer;
                break;
            case QuestionTypeEnum.SinglChoice:
                dto.singleChoiceAnswer = q.question?.question?.singleChoiceAnswer;
                break;
            case QuestionTypeEnum.TrueAndFalse:
                dto.trueFalseAnswer = q.question?.question?.trueFalseAnswer;
                break;
            case QuestionTypeEnum.SA:
                dto.saAnswer = q.question?.question?.saAnswer;
                break;
            case QuestionTypeEnum.Match:
                dto.matchAnswer = q.question?.question?.matchAnswer;
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
            // etc
        }
        return dto;
    }
}
