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

    ],
    declarations: [SupervisorsStudentsComponent],
    providers:[SessionSupervisorsServiceProxy ]
})
export class SupervisorsStudentsModule { }
