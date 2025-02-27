import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewDetailsComponent } from './view-details.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';



@NgModule({
  declarations: [
    ViewDetailsComponent
  ],
  imports: [
    CommonModule ,
  ],
  exports:[ViewDetailsComponent]
})
export class ViewDetailsModule { }
