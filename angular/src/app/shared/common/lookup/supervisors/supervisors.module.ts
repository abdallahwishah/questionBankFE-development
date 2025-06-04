import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorsComponent } from './supervisors.component';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { SubheaderModule } from '../../sub-header/subheader.module';
import { CreateOrEditSupervisorModalComponent } from './create-or-edit-supervisor-modal/create-or-edit-supervisor-modal.component';
import { ChangeProfilePictureModalModule } from '@app/shared/layout/profile/change-profile-picture-modal.module';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';
import { GovernoratesServiceProxy } from '@shared/service-proxies/service-proxies';

@NgModule({
    imports: [
        CommonModule,
        AdminSharedModule,
        TableModule,
        PaginatorModule,
        SubheaderModule,
        ActionButtonComponent,
        ChangeProfilePictureModalModule,
        AutoCompleteFeildModule,
        RouterModule.forChild([
            {
                path: '',
                component: SupervisorsComponent,
                pathMatch: 'full',
            },
        ]),
    ],
    declarations: [SupervisorsComponent, CreateOrEditSupervisorModalComponent],
    providers: [GovernoratesServiceProxy],
})
export class SupervisorsModule {}
