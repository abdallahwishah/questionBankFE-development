import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {SubjectUnitRoutingModule} from './subjectUnit-routing.module';
import {SubjectUnitsComponent} from './subjectUnits.component';
import {CreateOrEditSubjectUnitModalComponent} from './create-or-edit-subjectUnit-modal.component';
import {ViewSubjectUnitModalComponent} from './view-subjectUnit-modal.component';
import {SubjectUnitStudyLevelLookupTableModalComponent} from './subjectUnit-studyLevel-lookup-table-modal.component';
    					import {SubjectUnitStudySubjectLookupTableModalComponent} from './subjectUnit-studySubject-lookup-table-modal.component';
import { ActionButtonComponent } from "../../../components/action-button/action-button.component";



@NgModule({
    declarations: [
        SubjectUnitsComponent,
        CreateOrEditSubjectUnitModalComponent,
        ViewSubjectUnitModalComponent,

    					SubjectUnitStudyLevelLookupTableModalComponent,
    					SubjectUnitStudySubjectLookupTableModalComponent,
    ],
    imports: [AppSharedModule, SubjectUnitRoutingModule, AdminSharedModule, ActionButtonComponent],

})
export class SubjectUnitModule {
}
