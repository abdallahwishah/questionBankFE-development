import { Subscription } from 'rxjs';
import { Component, Input, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { DialogSharedService } from './dialog-shared.service';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'app-dialog-shared',
    templateUrl: './dialog-shared.component.html',
    styleUrls: ['./dialog-shared.component.scss'],
})
export class DialogSharedComponent extends AppComponentBase implements OnInit {
    constructor(
        private _dialogSharedService: DialogSharedService,
        injector: Injector,
    ) {
        super(injector);
    }
    @Input() width: string = '75vw';
    @Input() height!: string;
    @Input() dialogHeader: string = '';
    @Input() dialog_name: string = '';
    @Input() imageSrc: string = '';
    @Input() show: boolean = false;
    @Input() visible: boolean = true;
    @Input() showheader: boolean = true;
    @Input() showfooter: boolean = true;
    @Input() headersubscription: boolean = false;
    @Output() closeDialog = new EventEmitter();
    Subscription: Subscription = new Subscription();

    ngOnInit() {
        this._dialogSharedService.createInitValueForFilter(this.dialog_name);
        this.Subscription.add(
            this._dialogSharedService.SelectorFilterByComponent$(this.dialog_name, 'configShow').subscribe((value) => {
                this.show = value?.show;
            }),
        );
    }
    close() {
        this._dialogSharedService.hideDialog(this.dialog_name);
        this.closeDialog.emit();
    }
    ngOnDestroy(): void {
        this.Subscription.unsubscribe();
    }
}
