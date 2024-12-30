import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { RouterModule } from '@node_modules/@angular/router';
import { FiltersComponent } from "../../../../shared/components/filters/filters.component";
import { ActionButtonComponent } from "../../../../shared/components/action-button/action-button.component";
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { AddTestModalComponent } from "../../components/add-test-modal/add-test-modal.component";

@NgModule({
  imports: [
    CommonModule,
    AppSharedModule,
    RouterModule.forChild([
        {
            path: '',
            component: ListComponent,
        },
    ]),
    FiltersComponent,
    ActionButtonComponent,
    PaginatorComponent,
    AddTestModalComponent
],
  declarations: [ListComponent]
})
export class ListModule { }
