import {
    CreateOrEditSupervisorDto,
    SupervisorsServiceProxy,
} from './../../../../../../../shared/service-proxies/service-proxies';
import { Component, OnInit, Injector, Input } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';

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

    constructor(
        private Injector: Injector,
        private SupervisorsServiceProxy: SupervisorsServiceProxy,
        private _dialogSharedService: DialogSharedService,
    ) {
        super(Injector);
    }

    ngOnInit() {}
    Save() {
        this.SupervisorsServiceProxy.getAll;
        this.SupervisorsServiceProxy.createOrEdit(
            new CreateOrEditSupervisorDto({
                id: undefined,
                note: '',
                schoolId: this.schoolId,
                userId: this.SupervisoSelected?.supervisor.id,
            }),
        ).subscribe((res) => {
            this.notify.success('Supervisor Added Successfully');
            this.Close();
        });
    }
    Close() {
        this._dialogSharedService.hideDialog(this.Add_Supervisor_dialog);
    }
}
