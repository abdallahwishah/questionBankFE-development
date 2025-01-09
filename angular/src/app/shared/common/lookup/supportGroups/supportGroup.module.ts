import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {SupportGroupRoutingModule} from './supportGroup-routing.module';
import {SupportGroupsComponent} from './supportGroups.component';
import {CreateOrEditSupportGroupModalComponent} from './create-or-edit-supportGroup-modal.component';
import {ViewSupportGroupModalComponent} from './view-supportGroup-modal.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { InputSwitchModule } from 'primeng/inputswitch';



@NgModule({
    declarations: [
        SupportGroupsComponent,
        CreateOrEditSupportGroupModalComponent,
        ViewSupportGroupModalComponent,
        
    ],
    imports: [AppSharedModule, SupportGroupRoutingModule , AdminSharedModule,ActionButtonComponent,InputSwitchModule ],
    
})
export class SupportGroupModule {
}
