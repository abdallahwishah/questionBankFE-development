import { NgModule } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { StudySubjectRoutingModule } from './studySubject-routing.module';
import { StudySubjectsComponent } from './studySubjects.component';
import { CreateOrEditStudySubjectModalComponent } from './create-or-edit-studySubject-modal.component';
import { ViewStudySubjectModalComponent } from './view-studySubject-modal.component';
import { ActionButtonComponent } from '../../../components/action-button/action-button.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AutoCompleteFeildModule } from '@app/shared/components/auto-complete-feild/auto-complete-feild.module';
import { DialogSharedModule } from '@app/shared/components/dialog-shared/dialog-shared.module';

@NgModule({
    declarations: [StudySubjectsComponent, CreateOrEditStudySubjectModalComponent, ViewStudySubjectModalComponent],
    imports: [
        AppSharedModule,
        StudySubjectRoutingModule,
        AdminSharedModule,
        ActionButtonComponent,
        InputSwitchModule,
        AutoCompleteFeildModule,
        DialogSharedModule,
    ],
})
export class StudySubjectModule {}
