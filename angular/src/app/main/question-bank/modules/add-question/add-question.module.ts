import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddQuestionComponent } from './add-question.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { RouterModule } from '@node_modules/@angular/router';
import { DropdownFieldComponent } from '../../../../shared/components/fields/dropdown-field/dropdown-field.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { EditorComponent } from '../../../../shared/components/editor/editor.component';
import { DynamicQuestionComponent } from '@app/shared/components/questions/dynamic-question/dynamic-question.component';
import { AddFileModalComponent } from '../../components/add-file-modal/add-file-modal.component';
import { ComplexitiesServiceProxy, StudyLevelsServiceProxy, StudySubjectsServiceProxy, SubjectUnitsServiceProxy } from '@shared/service-proxies/service-proxies';

@NgModule({
    imports: [
        CommonModule,
        AppSharedModule,
        RouterModule.forChild([
            {
                path: '',
                component: AddQuestionComponent,
            },
            {
                path: ':id',
                component: AddQuestionComponent,
            },
        ]),
        DropdownFieldComponent,
        DynamicQuestionComponent,
        EditorComponent,
        InputSwitchModule,
        AddFileModalComponent,
    ],
    declarations: [AddQuestionComponent],
    providers:[StudyLevelsServiceProxy , StudySubjectsServiceProxy  , SubjectUnitsServiceProxy  , ComplexitiesServiceProxy ]
})
export class AddQuestionModule {}
