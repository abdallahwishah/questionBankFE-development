import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StudyLevelsComponent} from './studyLevels.component';



const routes: Routes = [
    {
        path: '',
        component: StudyLevelsComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class StudyLevelRoutingModule {
}
