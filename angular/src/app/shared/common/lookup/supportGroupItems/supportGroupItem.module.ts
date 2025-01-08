import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {SupportGroupItemRoutingModule} from './supportGroupItem-routing.module';
import {SupportGroupItemsComponent} from './supportGroupItems.component';
import {CreateOrEditSupportGroupItemModalComponent} from './create-or-edit-supportGroupItem-modal.component';
import {ViewSupportGroupItemModalComponent} from './view-supportGroupItem-modal.component';
import {SupportGroupItemSupportGroupLookupTableModalComponent} from './supportGroupItem-supportGroup-lookup-table-modal.component';
    					


@NgModule({
    declarations: [
        SupportGroupItemsComponent,
        CreateOrEditSupportGroupItemModalComponent,
        ViewSupportGroupItemModalComponent,
        
    					SupportGroupItemSupportGroupLookupTableModalComponent,
    ],
    imports: [AppSharedModule, SupportGroupItemRoutingModule , AdminSharedModule ],
    
})
export class SupportGroupItemModule {
}
