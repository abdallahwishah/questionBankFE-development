import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorsStudentsComponent } from './supervisors-students.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { TabViewModule } from 'primeng/tabview';
import { SessionSupervisorsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AddSupervisorComponent } from './components/add-supervisor/add-supervisor.component';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        TabViewModule,
        RouterModule.forChild([
            {
                path: '',
                component: SupervisorsStudentsComponent,
            },
        ]),
        DropdownFieldComponent,
        ActionButtonComponent,
        PaginatorComponent,
        DialogSharedModule,
        AutoCompleteFeildModule
    ],
    declarations: [SupervisorsStudentsComponent, AddSupervisorComponent],
    providers: [SessionSupervisorsServiceProxy],
})
export class SupervisorsStudentsModule {}
