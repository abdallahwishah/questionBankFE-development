import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { DropdownFieldComponent } from '@app/shared/components/dropdown-field/dropdown-field.component';
import { FiltersComponent } from '@app/shared/components/filters/filters.component';
import { RouterModule } from '@node_modules/@angular/router';

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
     DropdownFieldComponent,
     ActionButtonComponent,
     PaginatorComponent
 ],
  declarations: [ListComponent]
})
export class ListModule { }