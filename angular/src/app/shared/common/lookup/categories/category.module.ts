import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {CategoryRoutingModule} from './category-routing.module';
import {CategoriesComponent} from './categories.component';
import {CreateOrEditCategoryModalComponent} from './create-or-edit-category-modal.component';
import {ViewCategoryModalComponent} from './view-category-modal.component';
import { ActionButtonComponent } from "../../../components/action-button/action-button.component";



@NgModule({
    declarations: [
        CategoriesComponent,
        CreateOrEditCategoryModalComponent,
        ViewCategoryModalComponent,

    ],
    imports: [AppSharedModule, CategoryRoutingModule, AdminSharedModule, ActionButtonComponent],

})
export class CategoryModule {
}
