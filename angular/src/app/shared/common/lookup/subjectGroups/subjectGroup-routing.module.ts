import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SubjectGroupsComponent} from './subjectGroups.component';



const routes: Routes = [
    {
        path: '',
        component: SubjectGroupsComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SubjectGroupRoutingModule {
}
