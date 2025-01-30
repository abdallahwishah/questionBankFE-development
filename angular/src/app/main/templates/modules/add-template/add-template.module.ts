import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddTemplateComponent } from './add-template.component';
import { EditorComponent } from '@app/shared/components/editor/editor.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { DropdownFieldComponent } from '@app/shared/components/fields/dropdown-field/dropdown-field.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RouterModule } from '@node_modules/@angular/router';
import { DynamicQuestionComponent } from '@app/shared/components/questions/dynamic-question/dynamic-question.component';
import { AddFileModalComponent } from '@app/main/question-bank/components/add-file-modal/add-file-modal.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        RouterModule.forChild([
            {
                path: '',
                component: AddTemplateComponent,
            },
            {
                path: ':id',
                component: AddTemplateComponent,
            },
        ]),
        DropdownFieldComponent,
        DynamicQuestionComponent,
        EditorComponent,
        InputSwitchModule,
        AddFileModalComponent,
        SkeletonComponent,
        AutoCompleteFeildModule,
    ],
    declarations: [AddTemplateComponent],
})
export class AddTemplateModule {}
