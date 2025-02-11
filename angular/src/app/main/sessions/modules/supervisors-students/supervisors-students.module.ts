import { InputNumberModule } from 'primeng/inputnumber';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorsStudentsComponent } from './supervisors-students.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { TabViewModule } from 'primeng/tabview';
import { SessionSupervisorsServiceProxy, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AddSupervisorComponent } from './components/add-supervisor/add-supervisor.component';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';
import { AddStudentComponent } from './components/add-student/add-student.component';
import { MoveStudentComponent } from './components/move-student/move-student.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UserImageComponent } from '@app/shared/components/userImage/userImage.component';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { ExtendTimeSessionComponent } from './components/extendTimeSession/extendTimeSession.component';

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
        AutoCompleteFeildModule,
        InputNumberModule,
        RadioButtonModule,
        UserImageComponent,
        FiltersComponent,
        ExtendTimeSessionComponent,
    ],
    declarations: [SupervisorsStudentsComponent, AddSupervisorComponent, AddStudentComponent, MoveStudentComponent],
    providers: [SessionSupervisorsServiceProxy, StudentsServiceProxy],
})
export class SupervisorsStudentsModule {}
