import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddTemplateComponent } from './add-template.component';
import { DynamicQuestionComponent } from '@app/main/question-bank/components/dynamic-question/dynamic-question.component';
import { EditorComponent } from '@app/shared/components/editor/editor.component';
import { AddFileModalComponent } from '@app/main/question-bank/components/modals/add-file-modal/add-file-modal.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RouterModule } from '@node_modules/@angular/router';

@NgModule({
  imports: [
    CommonModule,
    AppSharedModule,
    RouterModule.forChild([
        {
            path: '',
            component: AddTemplateComponent,
        },
    ]),
    DropdownFieldComponent,
    DynamicQuestionComponent,
    EditorComponent,
    InputSwitchModule,
    AddFileModalComponent
  ],
  declarations: [AddTemplateComponent]
})
export class AddTemplateModule { }
