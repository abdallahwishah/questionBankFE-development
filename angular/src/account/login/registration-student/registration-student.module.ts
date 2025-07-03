import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationStudentComponent } from './registration-student.component';
import { RouterModule } from '@node_modules/@angular/router';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { StudentsServiceProxy } from '@shared/service-proxies/service-proxies';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        RouterModule.forChild([
            {
                path: '',
                component: RegistrationStudentComponent,
                pathMatch: 'full',
            },
        ]),
    ],
    declarations: [RegistrationStudentComponent],
    providers: [StudentsServiceProxy],
})
export class RegistrationStudentModule {}
