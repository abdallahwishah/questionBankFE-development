import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StudySubjectsComponent} from './studySubjects.component';



const routes: Routes = [
    {
        path: '',
        component: StudySubjectsComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StudySubjectRoutingModule {
}
