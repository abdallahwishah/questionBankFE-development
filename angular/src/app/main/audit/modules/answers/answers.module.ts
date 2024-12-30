import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnswersComponent } from './answers.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { PaginatorComponent } from '@app/shared/common/paginator/paginator.component';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
  imports: [
      CommonModule,
         AppSharedModule,
         RouterModule.forChild([
             {
                 path: '',
                 component: AnswersComponent,
             },
         ]),
         DropdownFieldComponent,
         ActionButtonComponent,
         PaginatorComponent
  ],
  declarations: [AnswersComponent]
})
export class AnswersModule { }
