import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewTestComponent } from './view-test.component';
import { EditorComponent } from '@app/shared/components/editor/editor.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { RouterModule } from '@node_modules/@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DynamicExamQuestionComponent } from '../../components/dynamic-exam-question/dynamic-exam-question.component';
import { DynamicQuestionComponent } from '@app/shared/components/questions/dynamic-question/dynamic-question.component';
import { AddFileModalComponent } from '@app/main/question-bank/components/add-file-modal/add-file-modal.component';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        RouterModule.forChild([
            {
                path: '',
                component: ViewTestComponent,
            },
            {
                path: ':id',
                component: ViewTestComponent,
            },
        ]),
        DropdownFieldComponent,
        DynamicQuestionComponent,
        EditorComponent,
        InputSwitchModule,
        AddFileModalComponent,
        DynamicExamQuestionComponent,
    ],
    declarations: [ViewTestComponent],
})
export class ViewTestModule {}
