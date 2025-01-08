import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SubjectUnitsComponent} from './subjectUnits.component';



const routes: Routes = [
    {
        path: '',
        component: SubjectUnitsComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SubjectUnitRoutingModule {
}
