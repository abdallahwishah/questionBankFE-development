import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {ComplexityRoutingModule} from './complexity-routing.module';
import {ComplexitiesComponent} from './complexities.component';
import {CreateOrEditComplexityModalComponent} from './create-or-edit-complexity-modal.component';
import {ViewComplexityModalComponent} from './view-complexity-modal.component';
import { ActionButtonComponent } from "../../../components/action-button/action-button.component";
import { InputSwitchModule } from 'primeng/inputswitch';



@NgModule({
    declarations: [
        ComplexitiesComponent,
        CreateOrEditComplexityModalComponent,
        ViewComplexityModalComponent,

    ],
    imports: [AppSharedModule, ComplexityRoutingModule, AdminSharedModule, ActionButtonComponent,InputSwitchModule],

})
export class ComplexityModule {
}
