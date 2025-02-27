import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyReportComponent } from './my-report.component';
import { RouterModule } from '@angular/router';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { ReportItemsServiceProxy } from '@shared/service-proxies/service-proxies';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: MyReportComponent,
                pathMatch: 'full',
            },
        ]),
        AppSharedModule,
        AdminSharedModule,
    ],
    declarations: [MyReportComponent],
    providers: [ReportItemsServiceProxy],
})
export class MyReportModule {}
