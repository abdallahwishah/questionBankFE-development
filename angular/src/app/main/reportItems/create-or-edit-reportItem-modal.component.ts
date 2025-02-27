import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import {
    ReportItemsServiceProxy,
    CreateOrEditReportItemDto,
    FrequencyEnum,
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTime } from 'luxon';

import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { SharedRolesComponent } from '@app/shared/components/shared-roles/shared-roles.component';

@Component({
    selector: 'createOrEditReportItemModal',
    templateUrl: './create-or-edit-reportItem-modal.component.html',
})
export class CreateOrEditReportItemModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild(SharedRolesComponent) RolesChlid: SharedRolesComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    active = false;
    saving = false;

    roleIds: any[];

    reportItem: CreateOrEditReportItemDto = new CreateOrEditReportItemDto();
    frequencyEnumOptions: any;
    constructor(
        injector: Injector,
        private _reportItemsServiceProxy: ReportItemsServiceProxy,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    show(reportItemId?: number): void {
        if (!reportItemId) {
            this.reportItem = new CreateOrEditReportItemDto();
            this.reportItem.id = reportItemId;

            this.active = true;
            this.modal.show();
        } else {
            this._reportItemsServiceProxy.getReportItemForEdit(reportItemId).subscribe((result) => {
                this.reportItem = result.reportItem;
                this.active = true;
                this.modal.show();
                this.roleIds = result.reportItem.roleIds;
                console.log('result', result);
            });
        }
    }

    save(): void {
        if (!this.RolesChlid.selectedRoles?.length) {
            this.notify.warn(this.l('PleaseSelectAtLeastOneRole'));
            return;
        } else {
            this.reportItem.roleIds = this.RolesChlid.selectedRoles?.map((value) => value.id);
            this.saving = true;
            this._reportItemsServiceProxy
                .createOrEdit(this.reportItem)
                .pipe(
                    finalize(() => {
                        this.saving = false;
                    })
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

    ngOnInit(): void {
        this.frequencyEnumOptions = Object.entries(FrequencyEnum)
            .filter(([key, value]) => typeof value === 'number')
            .map(([key, value]) => ({
                Name: this.l(key),
                Code: value,
            }));
    }
}
