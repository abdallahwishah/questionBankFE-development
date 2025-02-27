import { NgModule } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { DataConnectionRoutingModule } from './dataConnection-routing.module';
import { DataConnectionsComponent } from './dataConnections.component';
import { CreateOrEditDataConnectionModalComponent } from './create-or-edit-dataConnection-modal.component';
import { ViewDataConnectionModalComponent } from './view-dataConnection-modal.component';
import { DataConnectionsServiceProxy } from '@shared/service-proxies/service-proxies';
// import { SharedFilterModule } from '@app/shared/components/shared-filter/shared-filter.module';

@NgModule({
    declarations: [
        DataConnectionsComponent,
        CreateOrEditDataConnectionModalComponent,
        ViewDataConnectionModalComponent,
    ],
    imports: [AppSharedModule, DataConnectionRoutingModule, AdminSharedModule],
    // SharedFilterModule
    providers: [DataConnectionsServiceProxy],
})
export class DataConnectionModule {}
