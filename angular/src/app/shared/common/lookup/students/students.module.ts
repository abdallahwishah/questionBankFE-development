import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentsComponent } from './students.component';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { SubheaderModule } from '../../sub-header/subheader.module';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { RouterModule } from '@angular/router';
import { GovernoratesServiceProxy, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditStudentModalComponent } from './create-or-edit-student-modal/create-or-edit-student-modal.component';
import { ChangeProfilePictureModalModule } from '@app/shared/layout/profile/change-profile-picture-modal.module';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';

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
                component: StudentsComponent,
                pathMatch: 'full',
            },
        ]),
    ],
    declarations: [StudentsComponent, CreateOrEditStudentModalComponent],
    providers: [StudentsServiceProxy, GovernoratesServiceProxy],
})
export class StudentsModule {}
