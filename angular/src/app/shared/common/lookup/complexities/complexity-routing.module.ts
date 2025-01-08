import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ComplexitiesComponent} from './complexities.component';



const routes: Routes = [
    {
        path: '',
        component: ComplexitiesComponent,
        pathMatch: 'full'
    },
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ComplexityRoutingModule {
}
