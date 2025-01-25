import { ExtendSessionTimeDto, SessionsServiceProxy } from '@shared/service-proxies/service-proxies';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';

@Component({
    selector: 'app-extendTimeSession',
    templateUrl: './extendTimeSession.component.html',
    styleUrls: ['./extendTimeSession.component.css'],
})
export class ExtendTimeSessionComponent extends AppComponentBase implements OnInit {
    @Input() sessionId;
    @Input() schoolClassId;
    @Input() schoolId;
    constructor(
        private Injector: Injector,
        private _sessionServiceProxy: SessionsServiceProxy,
        private _dialogSharedService: DialogSharedService,
    ) {
        super(Injector);
    }
    _extendSessionTimeDto = new ExtendSessionTimeDto();
    extendTimeSession_dialog = UniqueNameComponents.extendTimeSession_dialog;

    ngOnInit() {}
    save() {
        this._extendSessionTimeDto.sessionId = this.sessionId;
        this._extendSessionTimeDto.schoolClassId = this.schoolClassId;
        this._extendSessionTimeDto.schoolId = this.schoolId;

        this._sessionServiceProxy.extendSessionTime(this._extendSessionTimeDto).subscribe((value) => {
            this.notify.success('Session Time Extended Successfully');
            this.Close();
        });
    }
    Close() {
        this._dialogSharedService.hideDialog(this.extendTimeSession_dialog);
    }
}
