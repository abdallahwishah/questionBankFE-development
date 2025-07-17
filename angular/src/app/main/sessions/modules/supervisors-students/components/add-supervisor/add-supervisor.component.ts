import {
    CreateOrEditSessionSupervisorDto,
    CreateOrEditSupervisorDto,
    RoleServiceProxy,
    SessionSupervisorsServiceProxy,
    SupervisorsServiceProxy,
} from './../../../../../../../shared/service-proxies/service-proxies';
import { Component, OnInit, Injector, Input, Output, EventEmitter } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SessionSupervisorRoleEnum } from './../../../../../../../shared/service-proxies/service-proxies';

@Component({
    selector: 'app-add-supervisor',
    templateUrl: './add-supervisor.component.html',
    styleUrls: ['./add-supervisor.component.css'],
})
export class AddSupervisorComponent extends AppComponentBase implements OnInit {
    Add_Supervisor_dialog = UniqueNameComponents.Add_Supervisor_dialog;
    SupervisoSelected: any;
    @Input() execuldedIdFilter: any;
    @Input() schoolId: any;
    @Input() sessionId;

    @Input() schoolClassId;

    supervisorType: string = 'monitor';
    SessionSupervisorRoleEnum = SessionSupervisorRoleEnum;
    roles;
    Role: any;
    @Output() onSupervisorAdded = new EventEmitter<any>();
    loading: boolean;

    constructor(
        private Injector: Injector,
        private SupervisorsServiceProxy: SupervisorsServiceProxy,
        private _SessionSupervisorsServiceProxy: SessionSupervisorsServiceProxy,
        private _dialogSharedService: DialogSharedService,
        private _roleService: RoleServiceProxy,
    ) {
        super(Injector);
    }

    ngOnInit() {
        this.loading = false;
    }
    Save() {
        this.loading = true;
        this._SessionSupervisorsServiceProxy
            .createOrEdit(
                new CreateOrEditSessionSupervisorDto({
                    id: undefined,
                    schoolClassId: this.schoolClassId,
                    sessionId: this.sessionId,
                    supervisorId: this.SupervisoSelected?.supervisor.id,
                    role: this.Role,
                }),
            )
            .subscribe({
                next: () => {
                    this.SupervisoSelected = undefined;
                    this.notify.success('Supervisor Added Successfully');
                    this.onSupervisorAdded.emit();
                    this.Close();
                },
                error: () => {
                    this.loading = false;
                },
            });
    }
    Close() {
        this._dialogSharedService.hideDialog(this.Add_Supervisor_dialog);
        this.loading = false;
    }
    clear() {
        this.SupervisoSelected = null;
        this.Role = null;
    }
}
