import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDxReportViewerComponent } from './dx-report-viewer.component';
import { DxReportViewerModule } from 'devexpress-reporting-angular';

@NgModule({
    imports: [CommonModule, DxReportViewerModule],
    declarations: [AppDxReportViewerComponent],
    exports:[AppDxReportViewerComponent]
})
export class DxReportViewerrModule {}
