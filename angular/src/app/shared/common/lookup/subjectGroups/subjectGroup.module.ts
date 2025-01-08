import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {SubjectGroupRoutingModule} from './subjectGroup-routing.module';
import {SubjectGroupsComponent} from './subjectGroups.component';
import {CreateOrEditSubjectGroupModalComponent} from './create-or-edit-subjectGroup-modal.component';
import {ViewSubjectGroupModalComponent} from './view-subjectGroup-modal.component';
import {SubjectGroupStudySubjectLookupTableModalComponent} from './subjectGroup-studySubject-lookup-table-modal.component';
    					import {SubjectGroupSupportGroupLookupTableModalComponent} from './subjectGroup-supportGroup-lookup-table-modal.component';
    					


@NgModule({
    declarations: [
        SubjectGroupsComponent,
        CreateOrEditSubjectGroupModalComponent,
        ViewSubjectGroupModalComponent,
        
    					SubjectGroupStudySubjectLookupTableModalComponent,
    					SubjectGroupSupportGroupLookupTableModalComponent,
    ],
    imports: [AppSharedModule, SubjectGroupRoutingModule , AdminSharedModule ],
    
})
export class SubjectGroupModule {
}
