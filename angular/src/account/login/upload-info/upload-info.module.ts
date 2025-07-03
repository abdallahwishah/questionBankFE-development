import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadInfoComponent } from './upload-info.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { RouterModule } from '@node_modules/@angular/router';
import { StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        CheckboxModule,
        RouterModule.forChild([
            {
                path: '',
                component: UploadInfoComponent,
                pathMatch: 'full',
            },
        ]),
    ],
    declarations: [UploadInfoComponent],
    providers: [StudentsServiceProxy],
})
export class UploadInfoModule {}
