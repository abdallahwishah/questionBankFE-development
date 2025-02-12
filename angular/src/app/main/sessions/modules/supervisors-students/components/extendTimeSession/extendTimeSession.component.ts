import { InputNumberModule } from 'primeng/inputnumber';
import { ExtendSessionTimeDto, SessionsServiceProxy } from '@shared/service-proxies/service-proxies';
import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { CommonModule } from '@node_modules/@angular/common';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';

@Component({
    standalone: true,
    imports: [CommonModule, AppSharedModule, DialogSharedModule, AutoCompleteFeildModule, InputNumberModule],
    selector: 'app-extendTimeSession',
    templateUrl: './extendTimeSession.component.html',
    styleUrls: ['./extendTimeSession.component.css'],
})
export class ExtendTimeSessionComponent extends AppComponentBase implements OnInit {
    @Input() sessionId;
    @Input() schoolClassId;
    @Input() schoolId;
    @Input() studentId;
@Output() extendTimeSession = new EventEmitter();
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
        this._extendSessionTimeDto.sessionId = this.sessionId || undefined;
        this._extendSessionTimeDto.schoolClassId = this.schoolClassId || undefined;
        this._extendSessionTimeDto.schoolId = this.schoolId || undefined;
        this._extendSessionTimeDto.afterMinutes = this._extendSessionTimeDto.afterMinutes || undefined;
        this._extendSessionTimeDto.studentId = this.studentId || undefined;
        this._sessionServiceProxy.extendSessionTime(this._extendSessionTimeDto).subscribe((value) => {
            this.notify.success('Session Time Extended Successfully');
            this.Close();
            this.extendTimeSession.emit(value);
            this._extendSessionTimeDto = new ExtendSessionTimeDto();
        });
    }
    Close() {
        this._dialogSharedService.hideDialog(this.extendTimeSession_dialog);
        this._extendSessionTimeDto = new ExtendSessionTimeDto();

    }
}
