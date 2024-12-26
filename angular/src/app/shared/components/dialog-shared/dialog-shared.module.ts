import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogSharedComponent } from './dialog-shared.component';
import { DialogModule } from 'primeng/dialog';
import { AppSharedModule } from '@app/shared/app-shared.module';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,

  ],
  declarations: [DialogSharedComponent],
  exports:[DialogSharedComponent]
})
export class DialogSharedModule { }
