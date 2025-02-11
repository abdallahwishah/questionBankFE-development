import { Subscription } from 'rxjs';
import { ExamAttemptsServiceProxy } from './../../../../../shared/service-proxies/service-proxies';
import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';

@Component({
    selector: 'app-exportByLevel',
    templateUrl: './exportByLevel.component.html',
    styleUrls: ['./exportByLevel.component.css'],
})
export class ExportByLevelComponent extends AppComponentBase {
    Export_By_Level_dialog = UniqueNameComponents.Export_By_Level_dialog;
    studyLevel;
    subscription = new Subscription();
    sessionId;
    constructor(
        injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _fileDownloadService: FileDownloadService,
        private _examAttemptsServiceProxy: ExamAttemptsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.subscription = this._DialogSharedService
            .SelectorFilterByComponent$(this.Export_By_Level_dialog, 'configShow')
            .subscribe((configShow) => {
                this.studyLevel = null;
                this.sessionId = configShow?.data?.sessionId;
            });
    }
    Save() {
        this.sessionId;
        this._examAttemptsServiceProxy
            .getExamAttemptsToExcel(
                undefined,
                undefined,
                undefined,
                undefined,
                this.studyLevel?.studyLevel?.id,
                this.sessionId,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            )
            .subscribe((val) => {
                this._fileDownloadService.downloadTempFile(val);
            });
    }
    closeDialog() {
        this._DialogSharedService.hideDialog(this.Export_By_Level_dialog);
    }
}
