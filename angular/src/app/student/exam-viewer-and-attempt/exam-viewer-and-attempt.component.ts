import { ExamsServiceProxy } from './../../../shared/service-proxies/service-proxies';
import { Component, OnInit } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-exam-viewer-and-attempt',
    templateUrl: './exam-viewer-and-attempt.component.html',
    styleUrls: ['./exam-viewer-and-attempt.component.css'],
})
export class ExamViewerAndAttemptComponent implements OnInit {
    constructor(private _examsServiceProxy: ExamsServiceProxy) {
        this.isViewer = window?.location.href.includes('viewer');
    }
    isViewer: any;
    ngOnInit() {
        if (this.isViewer) {
        } else {
        }
    }
}
