import { NgModule } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { GovernorateRoutingModule } from './governorate-routing.module';
import { GovernoratesComponent } from './governorates.component';
import { CreateOrEditGovernorateModalComponent } from './create-or-edit-governorate-modal.component';
import { ViewGovernorateModalComponent } from './view-governorate-modal.component';
import { GovernoratesServiceProxy } from '@shared/service-proxies/service-proxies';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
    declarations: [GovernoratesComponent, CreateOrEditGovernorateModalComponent, ViewGovernorateModalComponent],
    imports: [AppSharedModule, GovernorateRoutingModule, AdminSharedModule, InputSwitchModule],
    providers: [GovernoratesServiceProxy],
})
export class GovernorateModule {}
