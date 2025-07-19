import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
 import { AppSharedModule } from '@app/shared/app-shared.module';
import { ActionButtonComponent } from '@app/shared/components/action-button/action-button.component';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { SkeletonComponent } from '@app/shared/components/skeleton/skeleton.component';
import { RouterModule } from '@node_modules/@angular/router';
import { DynamicExamQuestionComponent } from "../../../../shared/components/questions-exam/dynamic-exam-question/dynamic-exam-question.component";
import { ViewAnswersAdminComponent } from './view-answers-admin.component';

@NgModule({
  imports: [
    CommonModule,
    AppSharedModule,
    RouterModule.forChild([
        {
            path: '',
            component: ViewAnswersAdminComponent,
        },
    ]),
    ActionButtonComponent,
    DropdownFieldComponent,
    SkeletonComponent,
    DynamicExamQuestionComponent
],
  declarations: [ViewAnswersAdminComponent]
})
export class ViewAnswersAdminModule { }
