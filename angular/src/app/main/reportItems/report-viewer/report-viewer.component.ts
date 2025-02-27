import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-report-viewer',
    templateUrl: './report-viewer.component.html',
    styleUrls: ['./report-viewer.component.css'],
})
export class ReportViewerComponent {
    reportUrl: any;

    constructor(private _activatedRoute: ActivatedRoute) {
        this.reportUrl = this._activatedRoute.snapshot.params['name'];
    }
}
