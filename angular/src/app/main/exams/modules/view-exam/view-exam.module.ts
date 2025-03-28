import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from '@app/shared/components/editor/editor.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { RouterModule } from '@node_modules/@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
 import { DynamicQuestionComponent } from '@app/shared/components/questions/dynamic-question/dynamic-question.component';
import { AddFileModalComponent } from '@app/main/question-bank/components/add-file-modal/add-file-modal.component';
import { ViewExamComponent } from './view-exam.component';
import { SkeletonComponent } from "../../../../shared/components/skeleton/skeleton.component";
import { DynamicExamQuestionComponent } from '@app/shared/components/questions-exam/dynamic-exam-question/dynamic-exam-question.component';
import { AddViewExamModalComponent } from '../../components/add-view-exam-modal/add-view-exam-modal.component';

@NgModule({
    imports: [
    CommonModule,
    AppSharedModule,
    RouterModule.forChild([
        {
            path: '',
            component: ViewExamComponent,
        },
        {
            path: ':id',
            component: ViewExamComponent,
        },
    ]),
    DropdownFieldComponent,
    DynamicQuestionComponent,
    EditorComponent,
    InputSwitchModule,
    AddFileModalComponent,
    DynamicExamQuestionComponent,
    SkeletonComponent,
    AddViewExamModalComponent
],
    declarations: [ViewExamComponent],
})
export class ViewExamModule {}
