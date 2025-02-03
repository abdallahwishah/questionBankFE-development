import { SidebarModule } from 'primeng/sidebar';
import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamsServiceProxy } from '@shared/service-proxies/service-proxies';
import { QuizComponent } from '../quiz/quiz.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Router } from '@node_modules/@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, QuizComponent, SidebarModule],
    selector: 'app-student-main',
    templateUrl: './student-main.component.html',
    styleUrls: ['./student-main.component.css'],
})
export class StudentMainComponent extends AppComponentBase implements OnInit, OnDestroy {
    days: string = '00';
    hours: string = '00';
    minutes: string = '00';
    seconds: string = '00';

    /** Reference to the polling interval for checking exam availability */
    private checkExamInterval: any;
    /** Reference to the Web Worker managing the timer */
    private timerWorker: Worker | undefined;

    sessionName: string | undefined;
    sideBar: boolean = false;
    totalSeconds: any;
    constructor(
        injector: Injector,
        private _examsServiceProxy: ExamsServiceProxy,
        private router: Router,
    ) {
        super(injector);
    }

    ngOnInit() {
        // 1. Get the exam data, which includes remainingTimeInSecond
        this._examsServiceProxy.getExpectedeExam().subscribe((response) => {
            this.sessionName = response.sessionName;
            const totalSeconds = response?.remainingTimeInSecond || 0;
            this.totalSeconds = totalSeconds;
            // 2. Start the Worker-based timer if there is time remaining
            if (totalSeconds > 0) {
                this.createTimerWorker(totalSeconds);
            }

            // 3. If exam is already available, navigate immediately
            if (response?.applyExamDto) {
                this.router.navigate(['/student/exam-attempt']);
            }
        });
    }

    ngOnDestroy() {
        // Cleanup: terminate the worker and clear any intervals
        if (this.timerWorker) {
            this.timerWorker.terminate();
        }
        if (this.checkExamInterval) {
            clearInterval(this.checkExamInterval);
        }
    }

    /**
     * Creates a Web Worker from a Blob. This Worker handles the countdown
     * in real-world time and won't freeze or get inaccurate when tabs are inactive.
     */
    private createTimerWorker(totalSeconds: number) {
        // We'll calculate an absolute endTime in milliseconds,
        // so the worker can track real time remaining.
        const endTime = Date.now() + totalSeconds * 1000;

        // Convert the worker function to a Blob URL
        const workerBlob = new Blob([this.getWorkerString()], {
            type: 'application/javascript',
        });
        const workerUrl = URL.createObjectURL(workerBlob);

        // Instantiate the worker
        this.timerWorker = new Worker(workerUrl);

        // Listen for messages (tick/finish) from the worker
        this.timerWorker.onmessage = ({ data }) => {
            if (data.type === 'tick') {
                // data.remainingSeconds is the accurate seconds left
                this.updateDisplay(data.remainingSeconds);
            } else if (data.type === 'finish') {
                // Timer finished -> check exam availability
                this.checkExamAvailability();
            }
        };

        // Start the countdown in the worker
        this.timerWorker.postMessage({ command: 'start', endTime });
    }

    /**
     * The stringified worker code for accurate countdown.
     * - Recomputes the remaining time by comparing Date.now() to the endTime.
     * - Schedules the next tick precisely to reduce drift.
     */
    private getWorkerString(): string {
        return `
            self.onmessage = (e) => {
                if (e.data.command === 'start') {
                    const endTime = e.data.endTime;
                    tick();

                    function tick() {
                        const now = Date.now();
                        const diff = endTime - now;

                        // If time is up or negative, send finish signal
                        if (diff <= 0) {
                            postMessage({ type: 'finish' });
                            close();
                            return;
                        }

                        // Calculate full seconds remaining
                        const remainingSeconds = Math.floor(diff / 1000);
                        postMessage({ type: 'tick', remainingSeconds });

                        // Calculate how long to wait until next full second
                        // e.g., if diff is 3201 ms, we wait ~201 ms to align the next second boundary
                        const nextInterval = diff % 1000 || 1000;
                        setTimeout(tick, nextInterval);
                    }
                }
            };
        `;
    }

    /**
     * Updates displayed days/hours/minutes/seconds based on total remaining seconds.
     */
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

    /**
     * Starts a polling interval that repeatedly calls getExpectedeExam
     * every 2 seconds until applyExamDto is found.
     */
    private checkExamAvailability() {
        if (this.checkExamInterval) {
            return;
        }

        this.checkExamInterval = setInterval(() => {
            this._examsServiceProxy.getExpectedeExam().subscribe((response) => {
                if (response?.applyExamDto) {
                    clearInterval(this.checkExamInterval);
                    this.checkExamInterval = null;
                    this.router.navigate(['/student/exam-attempt']);
                }
            });
        }, 2000);
    }
}
