﻿import { NgModule } from '@angular/core';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { EditUserPermissionsModalComponent } from './edit-user-permissions-modal.component';
import { CreateOrEditUserModalComponent } from './create-or-edit-user-modal.component';
import { ImpersonationService } from '@app/admin/users/impersonation.service';
import { DynamicEntityPropertyManagerModule } from '@app/shared/common/dynamic-entity-property-manager/dynamic-entity-property-manager.module';
import { ChangeProfilePictureModalModule } from '@app/shared/layout/profile/change-profile-picture-modal.module';
import { ExportExcelUserModalComponent } from './export-excel-user-modal.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
    declarations: [UsersComponent, EditUserPermissionsModalComponent, CreateOrEditUserModalComponent, ExportExcelUserModalComponent],
    imports: [AppSharedModule, AdminSharedModule, UsersRoutingModule, DynamicEntityPropertyManagerModule, ChangeProfilePictureModalModule,InputSwitchModule,ActionButtonComponent],
    providers: [ImpersonationService],
})
export class UsersModule {}
