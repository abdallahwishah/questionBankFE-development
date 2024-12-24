import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddQuestionComponent } from './add-question.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { RouterModule } from '@node_modules/@angular/router';
import { DropdownFieldComponent } from "../../../../shared/components/dropdown-field/dropdown-field.component";
import { InputSwitchModule  } from 'primeng/inputswitch';
import { DynamicQuestionComponent } from "../../components/dynamic-question/dynamic-question.component";
import { EditorComponent } from "../../components/editor/editor.component";

@NgModule({
  imports: [
    CommonModule,
    AppSharedModule,
    RouterModule.forChild([
        {
            path: '',
            component: AddQuestionComponent,
        },
    ]),
    DropdownFieldComponent,
    DynamicQuestionComponent,
    EditorComponent,
    InputSwitchModule
],
  declarations: [AddQuestionComponent]
})
export class AddQuestionModule { }
