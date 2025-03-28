import { filter } from 'rxjs/operators';
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
    DargFormQuestionsSubAnswers,
    DragTableAnswer,
    DragFormAnswer,
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
    studentAttemptId: string;

    // Our question array with local flags
    questionlist: any = [];

    // current question index
    currentIndex = 0;

    // UI state
    showInstructions = false;
    sidebarVisible = false;
    loading = false;

    // Timer
    private timer: any = null;
    private remainingSeconds = 0;
    remainingTime: string = '00:00:00';
    // NEW: examEndTime stores the exact timestamp (in ms) when the exam ends
    private examEndTime: number = 0;

    // localStorage key
    private LOCAL_STORAGE_KEY = 'MY_EXAM_DATA_V2';

    // localStorge  as exam
    private LOCAL_STORAGE_KEY_AsExam = 'Exam_{{id}}';

    // Warning dialog key
    Warning_dialog = UniqueNameComponents.Warning_dialog;
    FaildQuestions: any = [];

    public isOnline = navigator.onLine;

    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private router: Router,
        private _DialogSharedService: DialogSharedService,
    ) {
        super(injector);
    }
    handleOnline = () => {
        this.isOnline = true;
        console.log('Internet connection restored');
        this.resendFailedQuestions();
    };

    handleOffline = () => {
        this.isOnline = false;

        console.log('Internet connection lost');
    };
    studentAttemptIdForFaildQuestions: string = '';
    ngOnInit() {
        // Listen for online and offline events
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);
        // // Attempt to load from localStorage first
        const savedDataJson = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (savedDataJson) {
            try {
                const saved = JSON.parse(savedDataJson);
                this.FaildQuestions = saved.FaildQuestions;
                this.studentAttemptIdForFaildQuestions = saved.studentAttemptId;
                // this.examData = saved.examData;
                // this.studentAttemptId = saved.studentAttemptId;
                // this.questionlist = saved.questionlist || [];
                // this.currentIndex = saved.currentIndex || 0;
                // this.showInstructions = saved.showInstructions ?? true;
                // this.remainingTime = saved.remainingTime || '00:00:00';
                // // NEW: restore examEndTime from storage
                // this.examEndTime = saved.examEndTime || 0;

                // // Recalculate remainingSeconds based on examEndTime and current time
                // const now = new Date().getTime();
                // this.remainingSeconds = Math.floor((this.examEndTime - now) / 1000);

                // if (this.remainingSeconds > 0) {
                //     this.startTimer(this.remainingSeconds);
                // } else if (this.remainingSeconds <= 0 && this.examData) {
                //     // Time expired → final submission / clean-up
                //     this.handleTimeExpired();
                // }
            } catch (err) {
                // parse error → load fresh from server
            }
        }
        this.loadExamData();
    }
    resendFailedQuestions(studentAttemptIdForFaildQuestions?: string) {
        if (this.FaildQuestions.length) {
            // Attempt to resend failed questions
            this.saveSomeAnswersToServer(false, studentAttemptIdForFaildQuestions); // This will resend the failed questions
        }
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        // Clean up event listeners when the component is destroyed
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
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
            this.LOCAL_STORAGE_KEY_AsExam = 'Exam_' + response.studentAttemptId;

            // Convert raw question array into our LocalQuestion array
            this.questionlist = (response.examQuestions || []).map((q) => {
                return {
                    ...q,
                    isSynced: false,
                    sendFailed: false,
                    localDirty: false,
                };
            });
            this.questionlist.forEach((q) => {
                this.handleQuestionWithAnswer(q);
            });
            this.showInstructions = !!this.examData.examInstructions;

            const savedDataJsonAsExam = localStorage.getItem(this.LOCAL_STORAGE_KEY_AsExam);
            if (savedDataJsonAsExam) {
                try {
                    const savedAsExam = JSON.parse(savedDataJsonAsExam);
                    this.currentIndex = savedAsExam.currentIndex || 0;

                    this.showInstructions = savedAsExam.showInstructions;
                } catch (err) {
                    this.currentIndex = 0;
                }
            }

            // NEW: If the server provides remainingSeconds,
            // compute examEndTime based on current time
            if (this.examData.remainingSeconds) {
                this.remainingSeconds = Math.floor(this.examData.remainingSeconds);
                this.examEndTime = new Date().getTime() + this.remainingSeconds * 1000;
                if (this.remainingSeconds > 0) {
                    this.startTimer(this.remainingSeconds);
                } else {
                    this.handleTimeExpired();
                }
            }
            this.resendFailedQuestions(this.studentAttemptIdForFaildQuestions);
            this.saveToLocalStorage();
        });
    }

    // Re-calc time if the server returns new "remainingSeconds" after partial sync
    reCalTime() {
        if (this.examData.remainingSeconds) {
            // Update examEndTime using current time and the new remaining seconds
            this.examEndTime = new Date().getTime() + Math.floor(this.examData.remainingSeconds) * 1000;
            this.updateRemainingSeconds();
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
        let FaildQuestionsString = this.FaildQuestions?.map((value) => {
            return {
                id: value?.question?.id,
                value: value?.answer,
            };
        });
        const dataToStore = {
            FaildQuestions: FaildQuestionsString,
            studentAttemptId: this.studentAttemptId,
        };
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));

        const dataToStoreAsExam = {
            currentIndex: this.currentIndex,
            showInstructions: this.showInstructions,
        };
        localStorage.setItem(this.LOCAL_STORAGE_KEY_AsExam, JSON.stringify(dataToStoreAsExam));
    }

    private clearStorageAndRedirect() {
        // check FalidQuestions and send them with activating loading befor redirct and clear
        if (this.FaildQuestions.length) {
            this.loading = true;
            this.saveSomeAnswersToServer(true);
        }

        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
        this.router.navigate(['/student/main']);
    }

    // --------------------------
    // Timer
    // --------------------------
    startTimer(seconds: number) {
        // If examEndTime is not set or already passed, (re)calculate it
        if (!this.examEndTime || this.examEndTime < new Date().getTime()) {
            this.examEndTime = new Date().getTime() + seconds * 1000;
        }
        // Update remainingSeconds based on examEndTime
        this.updateRemainingSeconds();

        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            this.updateRemainingSeconds();
            if (this.remainingSeconds <= 0) {
                clearInterval(this.timer);
                this.remainingSeconds = 0;
                this.updateTimeDisplay(0);
                this.handleTimeExpired();
            } else {
                this.updateTimeDisplay(this.remainingSeconds);
            }
            // this.saveToLocalStorage();
        }, 1000);
    }

    // Helper to update remainingSeconds using examEndTime and current time
    updateRemainingSeconds() {
        const now = new Date().getTime();
        this.remainingSeconds = Math.floor((this.examEndTime - now) / 1000);
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

    get currentQuestion(): any {
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
        let checked = this.checkAnswered();
        if (!checked) {
            return;
        }
        if (this.isFirstQuestion) return;
        this.currentIndex--;
        this.saveToLocalStorage();

        // partial sync => current + failed
        this.saveSomeAnswersToServer(false);
    }

    nextCon() {
        if (!this.isOnline) {
            // Show alaret
            alert('يرجى التحقق من اتصالك بالإنترنت قبل الإنهاء.');
        } else {
            // Show confirm if user tries to end
            this._DialogSharedService.showDialog(this.Warning_dialog, {
                confirm: () => {
                    this.next(true);
                },
            });
        }
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
        let checked = this.checkAnswered();
        if (!checked) {
            return;
        }else{
            this.currentQuestion.isSynced = true;
        }

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
            return false;
        }
        if (dto.linkedQuestionAnswer) {
            // Check required for sub-questions
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
                return false;
            }
        }
        return true;
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
        this.saveToLocalStorage();
    }

    private saveSomeAnswersToServer(isLast: boolean, studentAttemptIdForFaildQuestions?: string) {
        if (!this.examData || !this.questionlist.length) return;
        let toSend = [];

        if (this.FaildQuestions?.length) {
            let FaildReqs = this.questionlist
                ?.map((value) => {
                    let found = this.FaildQuestions.find((x) => x.id === value.question.id);
                    return {
                        ...value,
                        answer: found ? found.value : null,
                        faild: !!found,
                    };
                })
                ?.filter((q) => q?.faild)
                .map((q) => this.buildOneAnswer(q));
            toSend = [...toSend, ...FaildReqs];
        }

        if (this.questionlist?.length) {
            let newReqs = this.questionlist.filter((q) => q?.localDirty).map((q) => this.buildOneAnswer(q));
            toSend = [...toSend, ...newReqs];
        }

        if (!toSend?.length) {
            return;
        }

        this._examsServiceProxy
            .answerExamQuestions(
                new SubmitAnswerExamQuestionsDto({
                    questionListWithAnswer: toSend,
                    studentAttemptId: studentAttemptIdForFaildQuestions || this.studentAttemptId || '',
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
                    if (res?.isSynced) {
                        toSend.forEach((dto) => {
                            const idx = this.questionlist.findIndex((x) => x.question.id === dto.questionId);

                            if (idx >= 0) {
                                this.questionlist[idx].isSynced = true;
                                this.questionlist[idx].localDirty = false;
                                this.questionlist[idx].sendFailed = false;
                            }
                        });
                        this.FaildQuestions = [];
                    } else {
                        toSend.forEach((dto) => {
                            const idx = this.questionlist.findIndex((x) => x.question.id == dto.questionId);
                            if (idx >= 0) {
                                this.questionlist[idx].sendFailed = true;
                            }
                        });
                        this.FaildQuestions = this.questionlist.filter((x) => x.sendFailed);
                    }

                    this.examData.remainingSeconds = res.remainingTimeInSecond;
                    this.reCalTime();

                    if (isLast) {
                        this.end();
                    } else {
                        this.saveToLocalStorage();
                    }
                },
                error: (err) => {
                    // mark them as failed
                    toSend.forEach((dto) => {
                        const idx = this.questionlist.findIndex((x) => x.question.id === dto.questionId);
                        if (idx >= 0) {
                            this.questionlist[idx].sendFailed = true;
                        }
                    });
                    this.FaildQuestions = this.questionlist.filter((x) => x.sendFailed);
                    this.saveToLocalStorage();
                },
            });
    }

    // Build a single question's answer
    private buildOneAnswer(q: any): ExamQuestionWithAnswerDto {
        const dto = new ExamQuestionWithAnswerDto();
        dto.examId = this.examData?.examId;
        dto.questionId = q.question?.id;
        dto.questionNo = q.questionNo;
        dto.questionNoInGeneral = q?.question.questionNoInGeneral;
        dto.sectionId = q.sectionId;
        dto.sectionNo = q.sectionNo;
        dto.type = q.question?.question?.question?.type;

        // fill relevant answer property
        switch (dto.type) {
            case QuestionTypeEnum.MutliChoice:
                dto.multipleChoiceAnswer = q.question?.question?.multipleChoiceAnswer;
                q.answer = dto.multipleChoiceAnswer;
                break;
            case QuestionTypeEnum.SinglChoice:
                dto.singleChoiceAnswer = q.question?.question?.singleChoiceAnswer;
                q.answer = dto.singleChoiceAnswer;
                break;
            case QuestionTypeEnum.TrueAndFalse:
                dto.trueFalseAnswer = q.question?.question?.trueFalseAnswer;
                q.answer = dto.trueFalseAnswer;
                break;
            case QuestionTypeEnum.SA:
                dto.saAnswer = q.question?.question?.saAnswer;
                q.answer = dto.saAnswer;
                break;
            case QuestionTypeEnum.Match:
                dto.matchAnswer = q.question?.question?.matchAnswer;
                q.answer = dto.matchAnswer;
                break;
            case QuestionTypeEnum.Rearrange:
                dto.rearrangeAnswer = q.question?.question?.rearrangeAnswer;
                q.answer = dto.rearrangeAnswer;
                break;
            case QuestionTypeEnum.Drawing:
                dto.drawingAnswer = q.question?.question?.drawingAnswer;
                q.answer = dto.drawingAnswer;
                break;
            case QuestionTypeEnum.DargingForm:
                dto.dragFormAnswer = q.question?.question?.dragFormAnswer;
                q.answer = dto.dragFormAnswer;
                break;
            case QuestionTypeEnum.DargingTable:
                dto.dragTableAnswer = q.question?.question?.dragTableAnswer?.map(
                    (value, index) =>
                        new DragTableAnswer({
                            title: q.question?.question?.questionPayload?.dragDropTableView?.headers?.[index],
                            words: value?.value,
                        }),
                );
                q.answer = dto.dragTableAnswer;
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
                q.answer = dto.linkedQuestionAnswer;
                break;
            // etc...
        }
        return dto;
    }
    handleQuestionWithAnswer(questionWithAnswer: any) {
        let type: QuestionTypeEnum = questionWithAnswer?.question?.question?.question?.type;
        let answer: any = {};

        // check if in failed questions
        let found = this.FaildQuestions.find((x) => x.id === questionWithAnswer?.question?.id);
        let valueInFaild = found?.value;

        switch (type) {
            case QuestionTypeEnum.MutliChoice:
                answer.multipleChoiceAnswer = valueInFaild || questionWithAnswer?.optionId;

                break;
            case QuestionTypeEnum.SinglChoice:
                answer.singleChoiceAnswer = valueInFaild || questionWithAnswer?.optionId?.[0];
                break;
            case QuestionTypeEnum.TrueAndFalse:
                answer.trueFalseAnswer = valueInFaild || questionWithAnswer?.optionId?.[0];
                break;
            case QuestionTypeEnum.SA:
                answer.saAnswer = valueInFaild || questionWithAnswer?.value?.[0];
                break;
            case QuestionTypeEnum.DargingTable:
                answer.dragTableAnswer = valueInFaild || questionWithAnswer?.dargTableQuestionsSubAnswersWithoutPinned;
                break;
            case QuestionTypeEnum.Drawing:
                let valueDraw;

                try {
                    valueDraw = JSON.parse(valueInFaild || questionWithAnswer?.value?.[0])?.DrawingAnswer;
                } catch {
                    valueDraw = '';
                }
                answer.drawingAnswer = valueDraw;
                break;
            case QuestionTypeEnum.DargingForm:
                answer.dragFormAnswer = [
                    new DargFormQuestionsSubAnswers(valueInFaild || questionWithAnswer?.dargFormQuestionsSubAnswers),
                ];
                break;
            case QuestionTypeEnum.LinkedQuestions:
                console.log('valueInFaild', valueInFaild || questionWithAnswer?.linkedQuestionsSubAnswers);

                // reorder questionWithAnswer?.linkedQuestionsSubAnswers as per linkedQuestions
                let linkedQuestionsSubAnswersOrdered = (
                    valueInFaild || questionWithAnswer?.linkedQuestionsSubAnswers
                )?.sort((a: any, b: any) => {
                    return (
                        questionWithAnswer?.question?.question?.linkedQuestions.findIndex(
                            (x: any) => x.question.id === (a.subQuestionId || a?.questionId),
                        ) -
                        questionWithAnswer?.question?.question?.linkedQuestions.findIndex(
                            (x: any) => x.question.id === (b.subQuestionId || b?.questionId),
                        )
                    );
                });
                answer.linkedQuestionAnswer = linkedQuestionsSubAnswersOrdered?.map((x: any, i) => {
                    let typex: QuestionTypeEnum =
                        questionWithAnswer?.question?.question?.linkedQuestions[i]?.question?.type;
                    let subAnswer: any = {};

                    switch (typex) {
                        case QuestionTypeEnum.MutliChoice:
                            subAnswer.multipleChoiceAnswer = x?.multipleChoiceAnswer || x.optionId;
                            break;
                        case QuestionTypeEnum.SinglChoice:
                            subAnswer.singleChoiceAnswer = x?.singleChoiceAnswer || x.optionId?.[0];
                            break;
                        case QuestionTypeEnum.TrueAndFalse:
                            subAnswer.trueFalseAnswer = x?.trueFalseAnswer || x.optionId?.[0];
                            break;
                        case QuestionTypeEnum.SA:
                            subAnswer.saAnswer = x?.value || x.value;
                            break;
                        case QuestionTypeEnum.Match:
                            subAnswer.matchAnswer = x?.matchValue || x.matchValue;
                            break;
                        case QuestionTypeEnum.DargingTable:
                            subAnswer.dragTableAnswer =
                                x?.dargTableQuestionsSubAnswersWithoutPinned ||
                                x.dargTableQuestionsSubAnswersWithoutPinned;
                            break;
                    }

                    return new SubQuestionAnswer({
                        questionId: x.subQuestionId || x?.questionId,
                        ...subAnswer,
                    });
                });
                break;
        }

        questionWithAnswer.question.question = {
            ...questionWithAnswer?.question?.question,
            ...answer,
        };
        //  if hasAsnwer => mark it as answered
        if (
            answer.multipleChoiceAnswer ||
            answer.singleChoiceAnswer ||
            answer.trueFalseAnswer ||
            answer.saAnswer ||
            answer.matchAnswer ||
            answer.dragTableAnswer ||
            answer.drawingAnswer ||
            answer.dragFormAnswer ||
            answer.linkedQuestionAnswer
        ) {
            questionWithAnswer.isSynced = true;
        }
    }
}
