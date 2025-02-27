import { NgModule } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { SharedRolesComponent } from './shared-roles.component';

@NgModule({
  declarations: [
    SharedRolesComponent
  ],
  imports: [AppSharedModule , AdminSharedModule],
  exports:[SharedRolesComponent]
})
export class SharedRolesModule { }
