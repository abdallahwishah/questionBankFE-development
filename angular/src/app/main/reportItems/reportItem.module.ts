import { NgModule } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { ReportItemRoutingModule } from './reportItem-routing.module';
import { ReportItemsComponent } from './reportItems.component';
import { CreateOrEditReportItemModalComponent } from './create-or-edit-reportItem-modal.component';
import { ViewReportItemModalComponent } from './view-reportItem-modal.component';
import { ViewDetailsModule } from '@app/shared/components/view-details/view-details.module';
import { ReportItemsDesginComponent } from './report-items-desgin/report-items-desgin.component';
import { DxReportDesignerModule } from 'devexpress-reporting-angular';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { DxReportViewerrModule } from '@app/shared/components/dx-report/dx-report-viewer/dx-report-viewer.module';
import { SharedRolesModule } from '@app/shared/components/shared-roles/shared-roles.module';
import { ReportItemsServiceProxy, ReportRolesServiceProxy } from '@shared/service-proxies/service-proxies';

@NgModule({
    declarations: [
        ReportItemsComponent,
        CreateOrEditReportItemModalComponent,
        ViewReportItemModalComponent,
        ReportItemsDesginComponent,
        ReportViewerComponent,
    ],
    imports: [
        AppSharedModule,
        ReportItemRoutingModule,
        AdminSharedModule,
        SharedRolesModule,
        ViewDetailsModule,
        DxReportDesignerModule,
        DxReportViewerrModule,
    ],
    providers: [ReportItemsServiceProxy, ReportRolesServiceProxy],
})
export class ReportItemModule {}
