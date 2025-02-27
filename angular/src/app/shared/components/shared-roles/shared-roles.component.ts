import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IRolesWithOrganizationUnit } from '@app/admin/organization-units/roles-with-organization-unit';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    FindOrganizationUnitRolesInput,
    NameValueDto,

    OrganizationUnitServiceProxy,
    ReportRolesServiceProxy,
    RolesToOrganizationUnitInput,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { map as _map } from 'lodash-es';
import { Table } from 'primeng/table';
import { finalize, filter } from 'rxjs/operators';

@Component({
    selector: 'app-shared-roles',
    templateUrl: './shared-roles.component.html',
    styleUrls: ['./shared-roles.component.css'],
})
export class SharedRolesComponent extends AppComponentBase implements OnInit {
    @Output() rolesAdded: EventEmitter<IRolesWithOrganizationUnit> = new EventEmitter<IRolesWithOrganizationUnit>();
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @Input() roleIds: any[]=[];

    organizationUnitId: number;

    isShown = false;
    filterText = '';
    tenantId?: number;
    saving = false;
    selectedRoles: any[];
    allRoles: any;

    constructor(
        injector: Injector,
        private _organizationUnitService: OrganizationUnitServiceProxy,
        private _nodeAuthorizationsServiceProxy: ReportRolesServiceProxy
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this._nodeAuthorizationsServiceProxy.getAllRoleForTableDropdown().subscribe((result) => {
            this.allRoles = result;
            console.log(' this.roleIds', this.roleIds);
            console.log(' result : ', result)
            this.selectedRoles = this.allRoles.filter((value) => this.roleIds.includes(value?.id));
        });
    }

    refreshTable(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    shown(): void {
        this.isShown = true;
        this.getRecordsIfNeeds(null);
    }
    selectedReportItem(itmes:any){
       console.log("itmes" , itmes)
    }

    getRecordsIfNeeds(event: LazyLoadEvent): void {
        if (!this.isShown) {
            return;
        }

        this.getRecords(event);
    }

    getRecords(event?: LazyLoadEvent): void {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);

            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        const input = new FindOrganizationUnitRolesInput();
        input.organizationUnitId = this.organizationUnitId;
        input.filter = this.filterText;
        input.skipCount = this.primengTableHelper.getSkipCount(this.paginator, event);
        input.maxResultCount = this.primengTableHelper.getMaxResultCount(this.paginator, event);

        this._organizationUnitService
            .findRoles(input)
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }
}
