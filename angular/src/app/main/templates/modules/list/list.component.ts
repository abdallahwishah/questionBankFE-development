import { Component, Injector, OnInit } from '@angular/core';
import { DialogSharedService } from '@app/shared/components/dialog-shared/dialog-shared.service';
import { UniqueNameComponents } from '@app/shared/Models/UniqueNameComponents';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ExamTemplatesServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class ListComponent extends AppComponentBase implements OnInit {
    Warning_dialog = UniqueNameComponents.Warning_dialog;
    Copy_Template_dialog = UniqueNameComponents.Copy_Template_dialog;

    filter: string;

    constructor(
        private _injector: Injector,
        private _DialogSharedService: DialogSharedService,
        private _examTemplatesServiceProxy: ExamTemplatesServiceProxy,
    ) {
        super(_injector);
    }

    ngOnInit() {
        this._examTemplatesServiceProxy
            .getAll(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)
            .subscribe((val) => {});
    }
    getQuestion() {}
    getList($event) {}

    doActions(label: any, record: any) {
        switch (label) {
            case 'View':
                console.log();
                break;
        }
    }

    addTemplate() {
        this._DialogSharedService.showDialog(this.Warning_dialog, {});
    }
    CopyTemplate() {
        this._DialogSharedService.showDialog(this.Copy_Template_dialog, {});
    }
}
