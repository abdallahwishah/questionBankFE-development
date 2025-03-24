import { Component, Injector, OnInit } from '@angular/core';
import { ChatSignalrService } from '@app/shared/layout/chat/chat-signalr.service';
import { NavigationEnd, Router } from '@node_modules/@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SignalRHelper } from 'shared/helpers/SignalRHelper';

@Component({
    selector: 'app-student',
    templateUrl: './student.component.html',
    styleUrls: ['./student.component.css'],
})
export class StudentComponent extends AppComponentBase {
    constructor(
        injector: Injector,
        private _router: Router,
        private _chatSignalrService: ChatSignalrService,
    ) {
        super(injector);
    }
    ngOnInit() {
        if (this.appSession.application) {
            SignalRHelper.initSignalR(() => {
                this._chatSignalrService.init();
            });
        }
    }
}
