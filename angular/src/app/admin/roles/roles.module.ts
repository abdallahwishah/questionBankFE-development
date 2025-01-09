import { NgModule } from '@angular/core';
import { RolesRoutingModule } from './roles-routing.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { RolesComponent } from './roles.component';
import { CreateOrEditRoleModalComponent } from './create-or-edit-role-modal.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';

@NgModule({
    declarations: [RolesComponent, CreateOrEditRoleModalComponent],
    imports: [AppSharedModule, AdminSharedModule, RolesRoutingModule,ActionButtonComponent],
})
export class RolesModule {}
