import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListComponent extends AppComponentBase implements OnInit {
    Add_Session_dialog = UniqueNameComponents.Add_Session_dialog;

    filter: string;

    constructor(private _injector: Injector,
        private _DialogSharedService: DialogSharedService

    ) { super(_injector); }

    ngOnInit() {
    }
    getQuestion() {

    }
    getList($event) {

    }
    AddSession() {
        this._DialogSharedService.showDialog(this.Add_Session_dialog, {});
    }
    doActions(label: any, record: any) {
        switch (label) {
            case 'View':
                console.log()
                break;

        }
    }
}

