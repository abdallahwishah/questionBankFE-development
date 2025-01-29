import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamsServiceProxy } from '@shared/service-proxies/service-proxies';
import { QuizComponent } from '../quiz/quiz.component';
import { StudentHeaderComponent } from '../student-header/student-header.component';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    standalone: true,
    imports: [CommonModule, QuizComponent, StudentHeaderComponent],
    selector: 'app-student-main',
    templateUrl: './student-main.component.html',
    styleUrls: ['./student-main.component.css'],
})
export class StudentMainComponent extends AppComponentBase implements OnInit, OnDestroy {
    days: string = '00';
    hours: string = '00';
    minutes: string = '00';
    seconds: string = '00';
    private timerInterval: any;
    sessionName: any;
    secondsValue: any = 1;
    userName: any;
    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
        this._examsServiceProxy.getExpectedeExam().subscribe((response) => {
            this.sessionName = response.sessionName;
            let seconds = response?.remainingTimeInSecond || 0;
            this.secondsValue = response?.remainingTimeInSecond || 0;

            if (seconds > 0) {
                this.startTimer(seconds);
            }
            if (response?.applyExamDto) {
                this.goToExam();
            }
        });
    }

    ngOnDestroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    private startTimer(totalSeconds: number) {
        this.updateDisplay(totalSeconds);

        this.timerInterval = setInterval(() => {
            this.secondsValue = totalSeconds;
            if (totalSeconds <= 0) {
                clearInterval(this.timerInterval);
                this.goToExam();
                return;
            }

            totalSeconds--;
            this.updateDisplay(totalSeconds);
        }, 1000);
    }

    private updateDisplay(totalSeconds: number) {
        const days = Math.floor(totalSeconds / (24 * 3600));
        const remainingSeconds = totalSeconds % (24 * 3600);
        const hrs = Math.floor(remainingSeconds / 3600);
        const mins = Math.floor((remainingSeconds % 3600) / 60);
        const secs = remainingSeconds % 60;

        this.days = days.toString().padStart(2, '0');
        this.hours = hrs.toString().padStart(2, '0');
        this.minutes = mins.toString().padStart(2, '0');
        this.seconds = secs.toString().padStart(2, '0');
    }

    goToExam() {
        const attemptUrl = '/student/exam-attempt/';
        window.open(
            attemptUrl,
            '_blank',
            `menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes,width=${screen.availWidth},height=${screen.availHeight}`,
        );
    }
}
