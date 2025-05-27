import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { GovernoratesServiceProxy, CreateOrEditGovernorateDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    selector: 'createOrEditGovernorateModal',
    templateUrl: './create-or-edit-governorate-modal.component.html',
})
export class CreateOrEditGovernorateModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    isCreate: boolean = true;

    governorate: CreateOrEditGovernorateDto = new CreateOrEditGovernorateDto();

    constructor(
        injector: Injector,
        private _governoratesServiceProxy: GovernoratesServiceProxy,
        private _dateTimeService: DateTimeService,
    ) {
        super(injector);
    }

    show(governorateId?: number): void {
        if (!governorateId) {
            this.governorate = new CreateOrEditGovernorateDto();
            this.isCreate = true;

            this.active = true;
            this.modal.show();
        } else {
            this.isCreate = false;
            this._governoratesServiceProxy.getGovernorateForEdit(governorateId).subscribe((result) => {
                this.governorate = result.governorate;

                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
        this.saving = true;

        if (this.isCreate) {
            this._governoratesServiceProxy
                .create(this.governorate)
                .pipe(
                    finalize(() => {
                        this.saving = false;
                    }),
                )
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        } else {
            this._governoratesServiceProxy
                .update(this.governorate)
                .pipe(
                    finalize(() => {
                        this.saving = false;
                    }),
                )
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    ngOnInit(): void {}
}
