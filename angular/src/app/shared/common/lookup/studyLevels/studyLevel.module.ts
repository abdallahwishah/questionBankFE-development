﻿import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {StudyLevelRoutingModule} from './studyLevel-routing.module';
import {StudyLevelsComponent} from './studyLevels.component';
import {CreateOrEditStudyLevelModalComponent} from './create-or-edit-studyLevel-modal.component';
import {ViewStudyLevelModalComponent} from './view-studyLevel-modal.component';
import { ActionButtonComponent } from "../../../components/action-button/action-button.component";
import { InputSwitchModule } from 'primeng/inputswitch';



@NgModule({
    declarations: [
        StudyLevelsComponent,
        CreateOrEditStudyLevelModalComponent,
        ViewStudyLevelModalComponent,

    ],
    imports: [AppSharedModule, StudyLevelRoutingModule, AdminSharedModule, ActionButtonComponent,InputSwitchModule],

})
export class StudyLevelModule {
}
